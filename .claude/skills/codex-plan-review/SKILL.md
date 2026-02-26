# Codex Plan Review

An iterative skill for reviewing and refining implementation plans using Codex as a critic.

## Overview

This skill facilitates a back-and-forth review process where:
1. Claude creates a unique plan ID and saves the plan to a file
2. Claude automatically invokes Codex CLI to review the plan
3. Claude reads the review and checks the verdict
4. If revise needed, Claude analyzes feedback and improves the plan
5. The cycle repeats until Codex approves or the user stops the process

## Usage

Activate this skill when you have an implementation plan that would benefit from external review and critique.

## Process

### Step 1: Initialize Review Session
- Generate a unique REVIEW_ID (e.g., timestamp-based: `date +%s` or random string)
- Initialize iteration counter: `ITERATION=1`
- Save the current plan to: `/tmp/claude-plan-${REVIEW_ID}.md`
- Inform the user of the file path
- Ask user if they want to use the default model (gpt-5.3-codex) or specify a different one
- Store the user's model choice as `MODEL`

### Step 2: Request Codex Review

Run codex CLI in non-interactive mode to review the plan:

**Command Template:**
```bash
codex exec \
  -m ${MODEL} \
  -s read-only \
  -o /tmp/codex-review-${REVIEW_ID}.md \
  "Review the implementation plan in /tmp/claude-plan-${REVIEW_ID}.md. Focus on:
1. Correctness - Will this plan achieve the stated goals?
2. Risks - What could go wrong? Edge cases? Data loss?
3. Missing steps - Is anything forgotten?
4. Alternatives - Is there a simpler or better approach?
5. User experience - Can we improve user experience for this plan?
6. Security - Any security concerns?

Be specific and actionable. If the plan is solid and ready to implement, end your review with exactly: VERDICT: APPROVED

If changes are needed, end with exactly: VERDICT: REVISE"
```

**Flags explained:**
- `-m ${MODEL}`: Use the user-specified model (default: gpt-5.3-codex)
- `-s read-only`: Codex can read the codebase for context but cannot modify anything
- `-o`: Capture the output to a file for reliable reading

**After running:**
- Output progress: "Round ${ITERATION} of 5 - Running Codex review..."
- Capture the session ID from output if needed for reference (though we use fresh exec calls)

### Step 3: Read Review and Check Verdict
- Read Codex's review from `/tmp/codex-review-${REVIEW_ID}.md`
- Output: "Reading review... Verdict: [APPROVED/REVISE]"
- Check the verdict at the end of the review:
  - If `VERDICT: APPROVED`: Proceed to Step 5 (Present Final Plan)
  - If `VERDICT: REVISE` and `ITERATION < 5`: Proceed to Step 4 to analyze and improve the plan
  - If `VERDICT: REVISE` and `ITERATION >= 5`: Proceed to Step 5 (maximum iterations reached)
  - If user says "stop" or "enough": Proceed to Step 5 (Present Final Plan)

### Step 4: Analyze Feedback and Improve Plan
- Carefully analyze the critique from Codex, focusing on:
  - Technical concerns
  - Missing edge cases
  - Alternative approaches
  - Potential issues or risks
  - Suggestions for improvement
- Address each point of feedback
- Revise the plan incorporating valid critiques
- Update the plan file at `/tmp/claude-plan-${REVIEW_ID}.md` with the revised version
- Explain to the user what changes were made and why
- Note any feedback that was not incorporated and the reasoning
- Increment iteration counter: `ITERATION++`
- Request re-review using a fresh codex exec call:

**Command Template for Re-review:**
```bash
codex exec \
  -m ${MODEL} \
  -s read-only \
  -o /tmp/codex-review-${REVIEW_ID}.md \
  "This is a follow-up review (Round ${ITERATION}). I've updated the plan in /tmp/claude-plan-${REVIEW_ID}.md to address the previous round of feedback.

Changes made in this iteration:
[List the specific changes made]

Please review the updated plan. If the plan is now solid and ready to implement, end with: VERDICT: APPROVED
If more changes are needed, end with: VERDICT: REVISE"
```

**Note:** We use fresh `codex exec` calls for each iteration rather than `codex resume` because:
- `codex resume` doesn't support the `-o` flag for output capture
- `codex resume` requires an interactive terminal and fails in non-interactive contexts
- Fresh calls ensure reliable output capture and work in all environments

- Go back to Step 3 to check the new verdict

### Step 5: Present Final Plan

**Show summary:**
```
Review Summary:
- Total rounds completed: ${ITERATION}
- Final verdict: [APPROVED/REVISE/STOPPED]
- Plan location: /tmp/claude-plan-${REVIEW_ID}.md
```

**If Codex approved the plan:**
- Inform the user: "✓ Codex has approved the plan! The final plan is ready to proceed."
- Show summary of improvements made across all rounds
- Ask if they'd like to proceed with implementation

**If plan was not approved after maximum iterations (5 rounds):**
- Inform the user: "We've completed 5 review rounds with Codex. The plan has not been fully approved yet."
- Show summary of all improvements made across all rounds
- List remaining concerns with severity levels from the last review
- Ask the user with specific options:
  1. **Proceed as-is**: "The plan has been significantly improved and is production-ready enough to implement"
  2. **Manual revision**: "Review the remaining concerns at /tmp/codex-review-${REVIEW_ID}.md and make final adjustments manually to the plan"
  3. **Continue later**: "Stop here and resume the review process later after addressing concerns offline"

**If user requested stop:**
- Inform the user: "Review process stopped as requested."
- Display the location of the current plan: `/tmp/claude-plan-${REVIEW_ID}.md`
- Show the last verdict from Codex and remaining concerns
- Show summary of improvements made in completed rounds
- Ask: "Would you like to proceed with the current plan or make manual adjustments?"

## Guidelines

**When Analyzing Feedback:**
- Be objective about criticisms
- Don't be defensive about the original plan
- Look for genuine improvements, not just validation
- Consider alternative perspectives seriously

**When Revising Plans:**
- Be specific about changes made
- Address all substantive concerns
- Maintain plan clarity and feasibility
- Don't over-complicate to satisfy every minor point

**Progress Tracking:**
- Always show current round number (e.g., "Round 3 of 5")
- After each round, summarize changes made
- Track cumulative improvements across all rounds

**When to Stop:**
- Codex provides "VERDICT: APPROVED"
- User requests to stop the review process
- Maximum iterations reached (5 rounds)

## Troubleshooting

### Codex CLI Not Found

If the `codex` command is not found when running Step 2, inform the user:

"It appears Codex CLI is not installed. To use this skill, you need to install Codex CLI first.

Please install Codex CLI in another terminal:
```bash
npm install -g @openai/codex
```

For more detailed instructions and setup, visit:
https://developers.openai.com/codex/cli

Once installed, please resume this session and we can continue with the plan review."

### Non-Interactive Terminal Error

If you encounter "stdin is not a terminal" or similar errors:
- This is expected in non-interactive environments like Claude Code
- The skill uses `codex exec` (not `codex resume`) which works in non-interactive contexts
- Each iteration creates a fresh Codex session, which is intentional for reliability

### Output Not Captured

If `/tmp/codex-review-${REVIEW_ID}.md` is empty or incomplete:
- Verify the `-o` flag is supported in your Codex CLI version
- Check that `/tmp` directory is writable
- Try running the command manually to verify output
- Ensure no firewall or network issues are blocking Codex API calls

### Session ID Not Found

If the session ID cannot be captured from output:
- This is not critical - we use fresh `codex exec` calls for each iteration
- Session IDs are only needed if you want to manually resume a session later
- The review process will continue normally without session ID tracking

## Example Interaction

```
Claude: I've saved the plan to /tmp/claude-plan-1708598400.md
Would you like to use the default model (gpt-5.3-codex) or specify a different one?

User: Default is fine

Claude: Round 1 of 5 - Running Codex review...

Reading review... Verdict: REVISE

Codex has identified several concerns:
1. Missing error handling for API failures
2. No consideration of rate limiting

I've updated the plan to address these concerns:
- Added retry logic with exponential backoff
- Implemented rate limiting checks before API calls

Round 2 of 5 - Running Codex review on the updated plan...

Reading review... Verdict: APPROVED

Review Summary:
- Total rounds completed: 2
- Final verdict: APPROVED
- Plan location: /tmp/claude-plan-1708598400.md

✓ Codex has approved the plan! The final plan is ready to proceed.

Improvements made:
- Round 1: Added error handling and rate limiting

Would you like to proceed with implementation?
```

## Command Reference

**Initial Review:**
```bash
codex exec -m gpt-5.3-codex -s read-only -o /tmp/codex-review-${REVIEW_ID}.md "Review the implementation plan in /tmp/claude-plan-${REVIEW_ID}.md. [criteria]"
```

**Subsequent Reviews:**
```bash
codex exec -m gpt-5.3-codex -s read-only -o /tmp/codex-review-${REVIEW_ID}.md "This is a follow-up review (Round ${ITERATION}). I've updated the plan. [changes and criteria]"
```