# ESLint Configuration for Landing Page CMS

## Prevent localStorage Regression

Add this rule to your ESLint configuration to automatically block localStorage usage for landing page content.

### For `apps/tenant-app/.eslintrc.json`:

```json
{
  "extends": ["../../.eslintrc.json"],
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "CallExpression[callee.object.name='localStorage'][callee.property.name='setItem'][arguments.0.value=/tenant_landing/]",
        "message": "🚨 FORBIDDEN: Do not use localStorage for landing page content. Use Landing Page CMS API instead. See ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md"
      },
      {
        "selector": "CallExpression[callee.object.name='localStorage'][callee.property.name='getItem'][arguments.0.value=/tenant_landing/]",
        "message": "🚨 FORBIDDEN: Do not use localStorage for landing page content. Use useLandingPageContent() hook instead. See ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md"
      }
    ]
  }
}
```

### Alternative: ESLint Plugin (Recommended)

Create a custom ESLint plugin for stronger enforcement:

**File**: `tools/eslint-plugin-smart-equiz/index.js`

```javascript
module.exports = {
  rules: {
    'no-landing-page-localstorage': {
      meta: {
        type: 'problem',
        docs: {
          description: 'Prevent localStorage usage for landing page content',
          category: 'Best Practices',
          recommended: true,
        },
        messages: {
          forbidden: '🚨 FORBIDDEN: localStorage for landing page content is not allowed. Use Landing Page CMS API (see ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md)',
        },
        schema: [],
      },
      create(context) {
        return {
          CallExpression(node) {
            // Check for localStorage.setItem or localStorage.getItem
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'localStorage' &&
              (node.callee.property.name === 'setItem' || 
               node.callee.property.name === 'getItem')
            ) {
              // Check if first argument contains 'tenant_landing'
              const firstArg = node.arguments[0];
              if (
                firstArg &&
                firstArg.type === 'Literal' &&
                typeof firstArg.value === 'string' &&
                firstArg.value.includes('tenant_landing')
              ) {
                context.report({
                  node,
                  messageId: 'forbidden',
                });
              }
              
              // Also check template literals
              if (
                firstArg &&
                firstArg.type === 'TemplateLiteral' &&
                firstArg.quasis.some(q => q.value.raw.includes('tenant_landing'))
              ) {
                context.report({
                  node,
                  messageId: 'forbidden',
                });
              }
            }
          },
        };
      },
    },
  },
};
```

**Usage in `.eslintrc.json`**:

```json
{
  "plugins": ["@smart-equiz"],
  "rules": {
    "@smart-equiz/no-landing-page-localstorage": "error"
  }
}
```

## Git Pre-commit Hook

**File**: `.husky/pre-commit` or `tools/hooks/pre-commit`

```bash
#!/bin/bash
# Prevent commits with localStorage for landing page content

echo "🔍 Checking for forbidden localStorage usage..."

# Check staged files for localStorage pattern
if git diff --cached --name-only | xargs grep -l "localStorage.*tenant_landing" 2>/dev/null; then
  echo ""
  echo "❌ ERROR: localStorage usage detected for landing page content!"
  echo ""
  echo "Files with forbidden pattern:"
  git diff --cached --name-only | xargs grep -l "localStorage.*tenant_landing" 2>/dev/null
  echo ""
  echo "💡 Solution: Use Landing Page CMS API instead:"
  echo "   - Import: import { useLandingPageContent } from '@/hooks/useLandingPageContent';"
  echo "   - Usage: const { content } = useLandingPageContent(tenantId);"
  echo ""
  echo "📖 See: ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md"
  echo ""
  exit 1
fi

echo "✅ No forbidden localStorage usage detected"
exit 0
```

**Make it executable**:

```powershell
# PowerShell
git update-index --chmod=+x .husky/pre-commit
```

```bash
# Bash/Linux
chmod +x .husky/pre-commit
```

## GitHub Actions CI Check

**File**: `.github/workflows/lint-architecture.yml`

```yaml
name: Architecture Lint

on:
  pull_request:
    paths:
      - 'apps/tenant-app/**'
      - 'apps/platform-admin/**'

jobs:
  check-forbidden-patterns:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Check for forbidden localStorage usage
        run: |
          echo "🔍 Checking for forbidden localStorage patterns..."
          
          # Check for tenant_landing localStorage usage
          if grep -r "localStorage.*tenant_landing" apps/tenant-app/src/ --exclude-dir=node_modules; then
            echo ""
            echo "❌ ERROR: localStorage usage detected for landing page content!"
            echo ""
            echo "💡 Solution: Use Landing Page CMS API instead"
            echo "📖 See: ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md"
            exit 1
          fi
          
          echo "✅ No forbidden localStorage usage detected"

      - name: Verify ADR references
        run: |
          echo "🔍 Verifying Architecture Decision Records exist..."
          
          if [ ! -f "ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md" ]; then
            echo "❌ ERROR: Missing ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md"
            exit 1
          fi
          
          echo "✅ All ADRs present"
```

## VS Code Settings

**File**: `.vscode/settings.json`

```json
{
  "eslint.validate": [
    "javascript",
    "typescript",
    "javascriptreact",
    "typescriptreact"
  ],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "search.exclude": {
    "**/node_modules": true,
    "**/.git": true
  },
  "search.useIgnoreFiles": true,
  
  // Highlight forbidden patterns
  "todo-tree.regex.regex": "(//|#|<!--|;|/\\*|^|^\\s*(-|\\d+.))\\s*($TAGS)|🚨\\s*FORBIDDEN",
  "todo-tree.highlights.customHighlight": {
    "FORBIDDEN": {
      "icon": "alert",
      "iconColour": "#FF0000",
      "foreground": "#FF0000",
      "background": "#FFCCCC",
      "type": "text"
    }
  }
}
```

## Testing the Safeguards

### Manual Test

```bash
# Try to commit code with localStorage for landing page
echo "localStorage.setItem('tenant_landing_123', 'test');" > test-forbidden.js
git add test-forbidden.js
git commit -m "Test forbidden pattern"

# Should fail with error message
# Clean up
git reset HEAD test-forbidden.js
rm test-forbidden.js
```

### Automated Test

**File**: `tools/test-architecture-safeguards.sh`

```bash
#!/bin/bash

echo "Testing architecture safeguards..."

# Create temporary file with forbidden pattern
TEMP_FILE="temp-test-forbidden.ts"
echo "localStorage.setItem('tenant_landing_test', JSON.stringify({}));" > $TEMP_FILE

# Stage the file
git add $TEMP_FILE

# Try to commit (should fail)
if git commit -m "Test forbidden pattern" 2>&1 | grep -q "FORBIDDEN"; then
  echo "✅ Pre-commit hook working correctly"
  git reset HEAD $TEMP_FILE
  rm $TEMP_FILE
  exit 0
else
  echo "❌ Pre-commit hook NOT working - localStorage pattern not blocked!"
  git reset HEAD $TEMP_FILE
  rm $TEMP_FILE
  exit 1
fi
```

## Installation Instructions

### 1. Install ESLint Rule

```powershell
# Add to package.json if using custom plugin
cd tools/eslint-plugin-smart-equiz
pnpm install
pnpm link

# In app directory
cd apps/tenant-app
pnpm link @smart-equiz/eslint-plugin
```

### 2. Install Git Hooks

```powershell
# Using Husky (recommended)
pnpm add -D husky
npx husky install
npx husky add .husky/pre-commit

# Copy content from above into .husky/pre-commit
```

### 3. Verify Installation

```powershell
# Test ESLint
cd apps/tenant-app
pnpm lint

# Test Git hook
.\tools\test-architecture-safeguards.sh
```

## Maintenance

### When to Update

- ✅ New forbidden patterns discovered
- ✅ New CMS systems added (e.g., similar to Landing Page CMS)
- ✅ ADR references change
- ❌ Never disable these safeguards without architectural approval

### Annual Review

Review and update safeguards annually or when:
- Major architecture changes occur
- New team members join
- Similar patterns need enforcement
- ADRs are updated

## Troubleshooting

### ESLint not catching localStorage

**Solution**: Ensure ESLint is running on save and the rule is properly configured.

```bash
# Check ESLint config
npx eslint --print-config apps/tenant-app/src/components/TenantLandingSettings.tsx
```

### Git hook not running

**Solution**: Ensure hooks are executable and Husky is installed.

```powershell
# Re-install Husky
npx husky install
git config core.hooksPath .husky
```

### False positives

**Solution**: Add exceptions to ESLint rule (sparingly and with justification in ADR).

```json
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "...",
        "message": "...",
        // Add ignore pattern if needed (requires strong justification)
      }
    ]
  }
}
```

---

**Last Updated**: November 25, 2024  
**Maintained By**: Architecture Team  
**Related**: ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md
