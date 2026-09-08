import { execFile } from 'node:child_process'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const DIALOG_TITLE = 'Select a Visual Studio solution file'
const FILTER_PROMPT = 'Select a Visual Studio solution file (.sln or .slnx)'

export async function pickSolutionFile(): Promise<string | null> {
  switch (process.platform) {
    case 'darwin':
      return pickOnMac()
    case 'win32':
      return pickOnWindows()
    default:
      return pickOnLinux()
  }
}

async function pickOnMac(): Promise<string | null> {
  const script = `
tell application "System Events"
  activate
  try
    set chosenFile to choose file with prompt "${FILTER_PROMPT}"
    return POSIX path of chosenFile
  on error
    return ""
  end try
end tell
`.trim()

  const { stdout } = await execFileAsync('osascript', ['-e', script])
  const selected = stdout.trim()
  return selected.length > 0 ? selected : null
}

async function pickOnWindows(): Promise<string | null> {
  const dir = await mkdtemp(path.join(tmpdir(), 'plate-dialog-'))
  const scriptPath = path.join(dir, 'pick.ps1')
  const script = `
Add-Type -AssemblyName System.Windows.Forms
[void][System.Windows.Forms.Application]::EnableVisualStyles()
$dialog = New-Object System.Windows.Forms.OpenFileDialog
$dialog.Title = "${DIALOG_TITLE}"
$dialog.Filter = "Solution files (*.sln;*.slnx)|*.sln;*.slnx|All files (*.*)|*.*"
$dialog.Multiselect = $false
$dialog.CheckFileExists = $true
$result = $dialog.ShowDialog()
if ($result -eq [System.Windows.Forms.DialogResult]::OK) {
  [Console]::Out.Write($dialog.FileName)
}
`.trim()

  try {
    await writeFile(scriptPath, script, 'utf8')
    const { stdout } = await execFileAsync('powershell.exe', [
      '-STA',
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      scriptPath,
    ])
    const selected = stdout.trim()
    return selected.length > 0 ? selected : null
  } finally {
    await rm(dir, { recursive: true, force: true })
  }
}

async function pickOnLinux(): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('zenity', [
      '--file-selection',
      `--title=${DIALOG_TITLE}`,
      '--file-filter=Solution files | *.sln *.slnx',
      '--file-filter=All files | *',
    ])
    const selected = stdout.trim()
    return selected.length > 0 ? selected : null
  } catch (error) {
    const err = error as { code?: string | number }
    if (err.code === 1 || err.code === '1') return null
    if (err.code === 'ENOENT') {
      throw new Error(
        'Could not open a file dialog. Install zenity, or use an OS with a native picker.',
      )
    }
    throw error
  }
}
