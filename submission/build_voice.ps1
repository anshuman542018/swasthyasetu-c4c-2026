$taskRoot = $PSScriptRoot
$taskAudio = Join-Path $taskRoot 'audio'
New-Item -ItemType Directory -Force $taskAudio | Out-Null
Add-Type -AssemblyName System.Speech
$taskSynth = New-Object System.Speech.Synthesis.SpeechSynthesizer
$taskSynth.SelectVoice('Microsoft Zira Desktop')
$taskSynth.Rate = 1
$taskSegments = Get-Content -Raw (Join-Path $taskRoot 'narration.json') | ConvertFrom-Json
for ($taskIndex = 0; $taskIndex -lt $taskSegments.Count; $taskIndex++) {
  $taskPath = Join-Path $taskAudio ('segment-{0:D2}.wav' -f $taskIndex)
  $taskSynth.SetOutputToWaveFile($taskPath)
  $taskSynth.Speak($taskSegments[$taskIndex].text)
  $taskSynth.SetOutputToNull()
}
$taskSynth.Dispose()
