Output day_96/agent-trial.gif
Output day_96/agent-trial.mp4

Set Shell "bash"
Set Theme "Dracula"
Set FontSize 18
Set Width 1200
Set Height 1200

# Slightly faster than default, but still readable
Set TypingSpeed 25ms

Type "clear"
Enter
Sleep 500ms


########################################
# Trial 1
########################################

Type "echo ================================================"
Enter
Type "echo Trial 1 - Target: 0.2 SOL | Max Transfer: 0.25 SOL"
Enter
Type "echo First run should transfer funds."
Enter
Type "echo ================================================"
Enter
Sleep 1500ms

Type "AGENT_TARGET=0.2 AGENT_PER_SOL=0.25 node --env-file=../.env day_96/agent-workflow.mjs"
Enter

# Adjust to your script runtime.
# Usually 12-18 seconds is enough.
Sleep 14s

Sleep 1200ms

Type "echo Running again..."
Enter
Sleep 1200ms

Type "AGENT_TARGET=0.2 AGENT_PER_SOL=0.25 node --env-file=../.env day_96/agent-workflow.mjs"
Enter

# This run should only check balances and exit.
Sleep 8s

Sleep 2s


########################################
# Trial 2
########################################

Type "clear"
Enter
Sleep 700ms

Type "echo ================================================"
Enter
Type "echo Trial 2 - Target: 0.4 SOL | Max Transfer: 0.05 SOL"
Enter
Type "echo Agent is expected to split into multiple transfers."
Enter
Type "echo ================================================"
Enter
Sleep 1500ms

Type "AGENT_TARGET=0.4 AGENT_PER_SOL=0.05 node --env-file=../.env day_96/agent-workflow.mjs"
Enter

# More tool calls = longer runtime
Sleep 18s

Sleep 2s


########################################
# Trial 3
########################################

Type "clear"
Enter
Sleep 700ms

Type "echo ================================================"
Enter
Type "echo Trial 3 - Target: 5 SOL | Max Transfer: 0.25 SOL"
Enter
Type "echo Source wallet cannot satisfy target."
Enter
Type "echo ================================================"
Enter
Sleep 1500ms

Type "AGENT_TARGET=5 AGENT_PER_SOL=0.25 node --env-file=../.env day_96/agent-workflow.mjs"
Enter

Sleep 8s

Sleep 3s

Type "echo ================================================"
Enter
Type "echo ============== 3 TRIALS COMPLETED ==============="
Enter
Type "echo ================================================"
Enter
Sleep 5s
