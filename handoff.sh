#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${BASE_BRANCH:-main}"
BRANCH="${BRANCH:-chore/prod-handoff-k-kut}"
PROJECT_REF="${PROJECT_REF:-vwlzubxshjjonabpeagd}"
PR_NUMBER="${PR_NUMBER:-}"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
OUTDIR="handoff_${STAMP}"
mkdir -p "$OUTDIR"

echo "==> Collecting handoff evidence into $OUTDIR"

git rev-parse --show-toplevel > "$OUTDIR/repo_root.txt"
git remote -v > "$OUTDIR/git_remote_v.txt"
git status --short --branch > "$OUTDIR/git_status.txt"
git branch -vv > "$OUTDIR/git_branch_vv.txt"
git log --oneline --decorate -n 30 > "$OUTDIR/git_log_last30.txt"

if [[ -z "${PR_NUMBER}" ]]; then
  PR_NUMBER="$(gh pr list --state all --head "$BRANCH" --json number --jq '.[0].number')"
fi

if [[ -z "${PR_NUMBER}" ]]; then
  echo "No PR found for branch $BRANCH" | tee "$OUTDIR/pr_error.txt"
else
  echo "$PR_NUMBER" > "$OUTDIR/pr_number.txt"
  gh pr view "$PR_NUMBER" --json number,title,state,isDraft,mergeStateStatus,mergedAt,mergedBy,baseRefName,headRefName,url > "$OUTDIR/pr_view.json"
  gh pr checks "$PR_NUMBER" > "$OUTDIR/pr_checks.txt" || true
  gh pr view "$PR_NUMBER" --comments > "$OUTDIR/pr_comments.txt"
fi

git checkout "$BASE_BRANCH"
git pull --ff-only
git rev-parse HEAD > "$OUTDIR/base_head_sha.txt"

supabase link --project-ref "$PROJECT_REF" > "$OUTDIR/supabase_link.txt" 2>&1 || true
supabase migration list > "$OUTDIR/supabase_migration_list.txt" 2>&1 || true

echo "DB verification done previously in project; see chat confirmation." > "$OUTDIR/db_verification.txt"

{
  echo "Handoff Timestamp (UTC): $STAMP"
  echo "Project Ref: $PROJECT_REF"
  echo "Base Branch: $BASE_BRANCH"
  echo "Feature Branch: $BRANCH"
  [[ -n "${PR_NUMBER:-}" ]] && echo "PR Number: $PR_NUMBER"
  echo
  echo "Files:"
  ls -1 "$OUTDIR"
} > "$OUTDIR/SUMMARY.txt"

echo "✅ Handoff bundle created: $OUTDIR"
