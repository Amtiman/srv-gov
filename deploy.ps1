# ============================================
# ROBUST GIT + NETLIFY DEPLOY SCRIPT
# Handles errors, conflicts, and missing remotes
# ============================================

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage,
    
    [Parameter(Mandatory=$false)]
    [string]$GitHubRepoName,
    
    [Parameter(Mandatory=$false)]
    [string]$NetlifySiteName,
    
    [switch]$SkipGitPush,
    [switch]$SkipNetlifyDeploy,
    [switch]$AutoGenerateNetlifyName
)

$ErrorActionPreference = "Continue"
$global:LASTEXITCODE = 0

# Color functions
function Write-Success { Write-Host "✓ $args" -ForegroundColor Green }
function Write-Error { Write-Host "✗ $args" -ForegroundColor Red }
function Write-Info { Write-Host "→ $args" -ForegroundColor Cyan }
function Write-Warning { Write-Host "⚠ $args" -ForegroundColor Yellow }
function Write-Step { Write-Host "`n========================================" -ForegroundColor Magenta; Write-Host " $args" -ForegroundColor Magenta; Write-Host "========================================`n" -ForegroundColor Magenta }

Write-Step "STARTING DEPLOYMENT PROCESS"

# ============================================
# STEP 0: VALIDATE PREREQUISITES
# ============================================
Write-Info "Step 0: Validating prerequisites..."

# Check Git
try {
    $gitVersion = git --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "Git not installed" }
    Write-Success "Git found"
} catch { Write-Error "Git not found"; exit 1 }

# Check GitHub CLI
try {
    $ghVersion = gh --version 2>$null
    if ($LASTEXITCODE -ne 0) { throw "GitHub CLI not installed" }
    Write-Success "GitHub CLI found"
    
    $ghAuth = gh auth status 2>$null
    if ($LASTEXITCODE -ne 0) { 
        Write-Error "Not logged into GitHub. Run: gh auth login"
        exit 1
    }
    Write-Success "GitHub authentication verified"
} catch { Write-Error "GitHub CLI required"; exit 1 }

# Check Netlify CLI
if (-not $SkipNetlifyDeploy) {
    try {
        $netlifyVersion = netlify --version 2>$null
        if ($LASTEXITCODE -ne 0) { throw "Netlify CLI not installed" }
        Write-Success "Netlify CLI found"
    } catch { 
        Write-Error "Netlify CLI required. Install: npm install -g netlify-cli"
        exit 1
    }
}

Write-Success "All prerequisites satisfied"

# ============================================
# STEP 1: RUN BUILD
# ============================================
Write-Step "STEP 1: Building Project"

if (-not (Test-Path "package.json")) {
    Write-Error "No package.json found. Are you in the correct directory?"
    exit 1
}

if (-not (Test-Path "node_modules")) {
    Write-Warning "node_modules not found. Running npm install..."
    npm install
    if ($LASTEXITCODE -ne 0) { Write-Error "npm install failed"; exit 1 }
}

Write-Info "Running build..."
npm run build
if ($LASTEXITCODE -ne 0) { 
    Write-Error "Build failed"
    exit 1
}
Write-Success "Build completed"

# Determine publish directory
$publishDir = if (Test-Path "dist") { "dist" } 
             elseif (Test-Path "build") { "build" }
             else { 
                 Write-Warning "No dist/ or build/ found, using current directory"
                 "."
             }
Write-Success "Publish directory: $publishDir"

# ============================================
# STEP 2: GIT OPERATIONS
# ============================================
if (-not $SkipGitPush) {
    Write-Step "STEP 2: Git Operations"
    
    # Initialize git if needed
    if (-not (Test-Path ".git")) {
        Write-Info "Initializing git repository..."
        git init
        if ($LASTEXITCODE -ne 0) { Write-Error "Git init failed"; exit 1 }
        Write-Success "Git initialized"
    }
    
    # Get GitHub username
    $currentUser = gh api user --jq '.login' 2>$null
    if (-not $currentUser) {
        Write-Error "Could not determine GitHub username"
        exit 1
    }
    
    # Set default repo name if not provided
    if (-not $GitHubRepoName) {
        $GitHubRepoName = (Get-Item -Path ".").Name
        Write-Info "Using directory name as repo: $GitHubRepoName"
    }
    
    $githubUrl = "https://github.com/$currentUser/$GitHubRepoName.git"
    
    # Check if repo exists, create if not
    Write-Info "Checking GitHub repository..."
    $repoExists = gh repo view $GitHubRepoName 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Repository doesn't exist. Creating..."
        gh repo create $GitHubRepoName --public --confirm 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Using --public flag failed, trying without..."
            gh repo create $GitHubRepoName --public
        }
        Write-Success "Repository created: https://github.com/$currentUser/$GitHubRepoName"
    } else {
        Write-Success "Repository exists"
    }
    
    # Handle remote origin (FIXED: proper error handling)
    Write-Info "Configuring remote origin..."
    $currentRemote = git remote get-url origin 2>$null
    if (-not $currentRemote) {
        Write-Info "Adding remote origin..."
        git remote add origin $githubUrl
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Failed to add remote"
            exit 1
        }
        Write-Success "Remote origin added"
    } else {
        Write-Success "Remote origin already exists: $currentRemote"
    }
    
    # Add files
    Write-Info "Staging files..."
    git add .
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Git add failed"
        exit 1
    }
    Write-Success "Files staged"
    
    # Commit changes
    Write-Info "Committing changes..."
    $commitResult = git commit -m "$CommitMessage" 2>&1
    if ($LASTEXITCODE -ne 0) {
        if ($commitResult -match "nothing to commit") {
            Write-Warning "No changes to commit"
        } else {
            Write-Error "Commit failed: $commitResult"
            exit 1
        }
    } else {
        Write-Success "Changes committed"
    }
    
    # Determine branch
    $currentBranch = git branch --show-current 2>$null
    if (-not $currentBranch) {
        $currentBranch = "main"
        git branch -M main
        Write-Info "Using branch: main"
    }
    
    # Push to GitHub with retry logic
    Write-Info "Pushing to GitHub..."
    $pushSuccess = $false
    for ($i = 1; $i -le 3; $i++) {
        Write-Info "Push attempt $i/3..."
        git push -u origin $currentBranch 2>&1
        if ($LASTEXITCODE -eq 0) {
            $pushSuccess = $true
            break
        }
        
        if ($i -eq 1) {
            Write-Warning "Push failed, trying force push..."
            git push -u origin $currentBranch --force 2>&1
            if ($LASTEXITCODE -eq 0) {
                $pushSuccess = $true
                break
            }
        }
        
        if ($i -lt 3) {
            Write-Warning "Retrying in 3 seconds..."
            Start-Sleep -Seconds 3
        }
    }
    
    if (-not $pushSuccess) {
        Write-Error "Failed to push to GitHub after 3 attempts"
        exit 1
    }
    Write-Success "Successfully pushed to GitHub"
}

# ============================================
# STEP 3: NETLIFY DEPLOYMENT
# ============================================
if (-not $SkipNetlifyDeploy) {
    Write-Step "STEP 3: Netlify Deployment"
    
    $deployedUrl = $null
    $netlifyProjectName = $NetlifySiteName
    
    # If no name provided, generate one
    if (-not $netlifyProjectName) {
        $randomName = "site-" + (Get-Random -Maximum 99999).ToString()
        $netlifyProjectName = $randomName
        Write-Info "No site name provided, using: $netlifyProjectName"
    }
    
    # Try to create/find Netlify site
    Write-Info "Setting up Netlify site..."
    
    # Check if already linked
    $linkedSite = $null
    if (Test-Path ".netlify/state.json") {
        try {
            $stateFile = Get-Content ".netlify/state.json" | ConvertFrom-Json
            $linkedSite = $stateFile.siteId
            Write-Success "Already linked to site: $linkedSite"
        } catch {}
    }
    
    # If not linked, try to find or create site
    if (-not $linkedSite) {
        # Try to find existing site
        Write-Info "Checking if site '$netlifyProjectName' exists..."
        $siteCheck = netlify sites:get $netlifyProjectName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Site exists and will be used"
            netlify link --name $netlifyProjectName 2>&1 | Out-Null
        } else {
            Write-Warning "Site '$netlifyProjectName' not found or already taken"
            
            # Try to create with the name
            Write-Info "Attempting to create site..."
            $createResult = netlify sites:create --name $netlifyProjectName 2>&1
            
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Name '$netlifyProjectName' is taken or invalid"
                
                if ($AutoGenerateNetlifyName) {
                    Write-Info "Auto-generating unique name..."
                    $createResult = netlify sites:create 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        Write-Success "Auto-generated site created"
                    }
                } else {
                    Write-Info "Creating site with random name..."
                    $createResult = netlify sites:create 2>&1
                    if ($LASTEXITCODE -ne 0) {
                        Write-Error "Failed to create site"
                        Write-Host $createResult -ForegroundColor Red
                        exit 1
                    }
                    Write-Success "Site created with random name"
                }
            } else {
                Write-Success "Site created: $netlifyProjectName"
            }
        }
    }
    
    # Get the actual site name from netlify
    $siteInfo = netlify status 2>&1
    if ($siteInfo -match "Site: (\S+)") {
        $actualSiteName = $matches[1]
        Write-Success "Deploying to site: $actualSiteName"
    }
    
    # Deploy to Netlify with retry logic
    Write-Info "Deploying to Netlify production..."
    $deploySuccess = $false
    
    for ($i = 1; $i -le 3; $i++) {
        Write-Info "Deployment attempt $i/3..."
        $deployOutput = netlify deploy --prod --dir $publishDir 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $deploySuccess = $true
            
            # Extract URLs from output
            if ($deployOutput -match "https://([a-zA-Z0-9\-]+)\.netlify\.app") {
                $deployedUrl = $matches[0]
            } elseif ($deployOutput -match "Website URL:\s+(https://\S+)") {
                $deployedUrl = $matches[1]
            } elseif ($deployOutput -match "https://\S+\.netlify\.app") {
                $urlMatch = [regex]::Match($deployOutput, "https://\S+\.netlify\.app")
                if ($urlMatch.Success) {
                    $deployedUrl = $urlMatch.Value
                }
            }
            break
        }
        
        if ($i -lt 3) {
            Write-Warning "Deployment failed, retrying in 5 seconds..."
            Start-Sleep -Seconds 5
        }
    }
    
    if (-not $deploySuccess) {
        Write-Error "Failed to deploy to Netlify after 3 attempts"
        Write-Host "Try running manually: netlify deploy --dir $publishDir --prod"
        exit 1
    }
    
    Write-Success "Deployment successful!"
    
    # Determine final URL
    if (-not $deployedUrl) {
        # Get site info to find URL
        $statusOutput = netlify status 2>&1
        if ($statusOutput -match "URL:\s+(https://\S+)") {
            $deployedUrl = $matches[1]
        } else {
            $deployedUrl = "https://app.netlify.com/sites"
            Write-Warning "Could not extract URL automatically"
        }
    }
    
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "🎉 DEPLOYMENT COMPLETE! 🎉" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "🌐 Site URL: $deployedUrl" -ForegroundColor Cyan
    Write-Host "📦 GitHub: $githubUrl" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Green
    
    # Try to open in browser
    try {
        Start-Process $deployedUrl
        Write-Success "Opened site in your browser"
    } catch {}
}

Write-Step "DEPLOYMENT PROCESS FINISHED"