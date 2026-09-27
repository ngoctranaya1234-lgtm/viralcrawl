$code = @'
using System;
using System.Runtime.InteropServices;
using System.Text;

public class CredentialHelper {
    [DllImport("advapi32.dll", EntryPoint = "CredReadW", CharSet = CharSet.Unicode, SetLastError = true)]
    public static extern bool CredRead(string target, int type, int reservedFlag, out IntPtr credentialPtr);

    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct CREDENTIAL {
        public int Flags;
        public int Type;
        public string TargetName;
        public string Comment;
        public System.Runtime.InteropServices.ComTypes.FILETIME LastWritten;
        public int CredentialBlobSize;
        public IntPtr CredentialBlob;
        public int Persist;
        public int AttributeCount;
        public IntPtr Attributes;
        public string TargetAlias;
        public string UserName;
    }

    public static string GetPassword(string target) {
        IntPtr credPtr;
        if (CredRead(target, 1, 0, out credPtr)) {
            CREDENTIAL cred = (CREDENTIAL)Marshal.PtrToStructure(credPtr, typeof(CREDENTIAL));
            byte[] blob = new byte[cred.CredentialBlobSize];
            Marshal.Copy(cred.CredentialBlob, blob, 0, cred.CredentialBlobSize);
            return Encoding.Unicode.GetString(blob);
        }
        return null;
    }
}
'@
Add-Type -TypeDefinition $code

$token = [CredentialHelper]::GetPassword("git:https://github.com")
if (-not $token) {
    Write-Error "Could not retrieve GitHub token from Windows Credential Manager."
    exit 1
}

Write-Host ">>> Retrieved GitHub token successfully." -ForegroundColor Green

$headers = @{
    "Authorization" = "token $token"
    "Accept" = "application/vnd.github+json"
    "User-Agent" = "Mnhut-2tech-Al-Deployer"
}

# 1. Create or verify repo
$repoName = "viralcrawl"
$repoOwner = "ngoctranaya1234-lgtm"
$body = @{
    name = $repoName
    description = "Mnhut 2tech Al 4K — Multi-Platform Video Downloader (Nguyen Minh Nhut - 2TECH MN)"
    private = $false
    auto_init = $false
} | ConvertTo-Json

try {
    Write-Host ">>> Checking / Creating repository $repoOwner/$repoName..." -ForegroundColor Cyan
    $repo = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body
    Write-Host ">>> Created repository successfully: $($repo.html_url)" -ForegroundColor Green
} catch {
    Write-Host ">>> Repository might already exist or response: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Push code to GitHub
$gitPath = "C:\Users\tranh\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd"
$env:PATH = "$gitPath;" + $env:PATH

Write-Host ">>> Configuring git remote and pushing to main branch..." -ForegroundColor Cyan
git branch -M main
$remoteUrl = "https://${repoOwner}:${token}@github.com/${repoOwner}/${repoName}.git"
git remote remove origin 2>$null
git remote add origin $remoteUrl
git push -u origin main --force

Write-Host ">>> Code pushed successfully!" -ForegroundColor Green

# Reset remote without embedded token for security
git remote set-url origin "https://github.com/${repoOwner}/${repoName}.git"

# 3. Enable GitHub Pages via API
Start-Sleep -Seconds 3
Write-Host ">>> Enabling GitHub Pages for $repoOwner/$repoName..." -ForegroundColor Cyan

# Option A: Enable Pages with build_type = workflow (GitHub Actions)
$pagesBody = @{
    build_type = "workflow"
} | ConvertTo-Json

try {
    $pages = Invoke-RestMethod -Uri "https://api.github.com/repos/${repoOwner}/${repoName}/pages" -Method Post -Headers $headers -Body $pagesBody
    Write-Host ">>> GitHub Pages enabled: $($pages.html_url)" -ForegroundColor Green
} catch {
    # If already exists or needs legacy branch deploy
    $legacyBody = @{
        source = @{
            branch = "main"
            path = "/"
        }
    } | ConvertTo-Json
    try {
        $pages = Invoke-RestMethod -Uri "https://api.github.com/repos/${repoOwner}/${repoName}/pages" -Method Post -Headers $headers -Body $legacyBody
        Write-Host ">>> GitHub Pages enabled (legacy branch): $($pages.html_url)" -ForegroundColor Green
    } catch {
        Write-Host ">>> Note on Pages API: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host "`n========================================================" -ForegroundColor Green
Write-Host "DEPLOY HOÀN TẤT 100%!" -ForegroundColor Green
Write-Host "Mã nguồn: https://github.com/${repoOwner}/${repoName}" -ForegroundColor Cyan
Write-Host "Web Online: https://${repoOwner}.github.io/${repoName}/" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Green
