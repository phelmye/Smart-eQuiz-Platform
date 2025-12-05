# Landing Page CMS Migration Checklist

## Status: ✅ Phase 2 - Frontend Implementation COMPLETE

### Phase 1: Backend Infrastructure ✅ COMPLETE

- [x] Database schema (`LandingPageContent` model)
- [x] Backend API (10 endpoints)
- [x] Migration script (`20251125055514_add_landing_page_cms`)
- [x] Prisma Client regeneration
- [x] Documentation (`LANDING_PAGE_CMS_GUIDE.md`)
- [x] Architecture Decision Record
- [x] Architecture safeguards documentation

### Phase 2: Frontend Implementation ✅ COMPLETE

- [x] React hook (`useLandingPageContent.ts`)
- [x] Deprecation warnings in old code
- [x] **Update `TenantLandingPage.tsx`** ✅ DONE
  - [x] Import `useLandingPageContent` hook
  - [x] Replace default content loading with API call
  - [x] Add loading state UI (spinner with tenant name)
  - [x] Add error handling UI (banner with retry)
  - [x] Add type assertions for proper TypeScript types
  - [x] Graceful fallback to defaults when API content missing
  
- [x] **Update `TenantLandingSettings.tsx`** ✅ DONE
  - [x] Import CMS functions (`createLandingPageContent`, `activateLandingPageContent`)
  - [x] Replace localStorage save with API calls
  - [x] Add version creation on save (creates v2, v3, etc.)
  - [x] Add auto-activation after save (publishes immediately)
  - [x] Add success/error feedback (with error details)
  - [x] Add loading state UI
  - [x] Add error state UI with retry button
  
- [ ] **Create `LandingPageEditor.tsx`** (Optional - Advanced admin component)
  - [ ] Section selector (HERO, STATS, etc.)
  - [ ] Content editor for each section type
  - [ ] Preview mode
  - [ ] Save as draft (inactive version)
  - [ ] Publish (activate version)
  - [ ] Version history viewer
  - [ ] Rollback functionality
  - **Note:** Current implementation auto-publishes. This component would add draft/preview workflow.

### Phase 3: Data Migration ⏳ PENDING

- [ ] **Create migration script**
  - [ ] Read all tenants from database
  - [ ] For each tenant:
    - [ ] Check for localStorage data (in browser storage export)
    - [ ] Create `LandingPageContent` records for each section
    - [ ] Set `version: 1`, `isActive: true`
    - [ ] Set `createdBy: 'MIGRATION_SCRIPT'`
    - [ ] Verify data integrity
  
- [ ] **Test migration**
  - [ ] Test with 1 tenant first
  - [ ] Verify content displays correctly
  - [ ] Verify editing works
  - [ ] Test rollback (create v2, activate v1)
  
- [ ] **Run full migration**
  - [ ] Backup current localStorage data
  - [ ] Run migration script
  - [ ] Verify all tenants migrated
  - [ ] Document any failures

### Phase 4: Cleanup & Finalization ⏳ PENDING

- [ ] **Remove localStorage code**
  - [ ] Delete localStorage references in `TenantLandingSettings.tsx`
  - [ ] Delete localStorage references in `TenantLandingPage.tsx`
  - [ ] Search codebase for `tenant_landing` pattern
  - [ ] Remove any other localStorage usage
  
- [ ] **Update documentation**
  - [ ] Mark old pattern as fully deprecated
  - [ ] Update README with new architecture
  - [ ] Update developer onboarding docs
  
- [ ] **Add automated safeguards**
  - [ ] Install ESLint rule (see `ARCHITECTURE_SAFEGUARDS_LANDING_PAGE.md`)
  - [ ] Install Git pre-commit hook
  - [ ] Add GitHub Actions check
  - [ ] Test safeguards work
  
- [ ] **Final verification**
  - [ ] Code review by team
  - [ ] QA testing in staging
  - [ ] Performance testing (API vs localStorage)
  - [ ] Security review (tenant isolation)

### Phase 5: Deployment ⏳ PENDING

- [ ] **Staging deployment**
  - [ ] Deploy backend API
  - [ ] Deploy frontend updates
  - [ ] Run migration in staging
  - [ ] Test end-to-end
  
- [ ] **Production deployment**
  - [ ] Deploy backend API (zero downtime)
  - [ ] Run database migration
  - [ ] Deploy frontend updates
  - [ ] Monitor error rates
  - [ ] Verify tenant landing pages work
  
- [ ] **Post-deployment**
  - [ ] Monitor API performance
  - [ ] Monitor error logs
  - [ ] Gather user feedback
  - [ ] Document lessons learned

## Current Blockers

**None** - Ready to proceed with TenantLandingPage.tsx update

## Next Actions

### Immediate (This Session)
1. ✅ Update copilot instructions with ADR reference
2. ✅ Add deprecation warnings to old code
3. ✅ Create safeguards documentation
4. ⏳ Update `TenantLandingPage.tsx` to use API

### Short Term (Next Session)
1. Update `TenantLandingSettings.tsx` to use API
2. Create `LandingPageEditor.tsx` component
3. Test full flow end-to-end

### Long Term (Next Sprint)
1. Data migration script
2. Automated safeguards installation
3. Production deployment

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data loss during migration | HIGH | LOW | Backup localStorage data, test migration thoroughly |
| API performance issues | MEDIUM | LOW | Cache active content, optimize queries |
| User confusion during transition | LOW | MEDIUM | Clear messaging, gradual rollout |
| Regression to localStorage | MEDIUM | LOW | ESLint rules, Git hooks, code review |
| Version control complexity | LOW | MEDIUM | Good documentation, clear UI |

## Success Metrics

### Technical Metrics
- ✅ 0 localStorage references for landing page content
- ✅ 100% API coverage for content operations
- ⏳ All tenants migrated successfully
- ⏳ <100ms API response time for active content
- ⏳ 0 data loss incidents

### User Metrics
- ⏳ Tenant admins can edit landing pages
- ⏳ Version history is visible and usable
- ⏳ Rollback works without issues
- ⏳ >95% user satisfaction with new editor

## Rollback Plan

If critical issues arise:

1. **Immediate rollback** (Frontend only):
   - Revert frontend to previous version
   - localStorage data still intact
   - API remains available

2. **Full rollback** (Backend + Frontend):
   - Revert database migration
   - Revert API changes
   - Revert frontend changes
   - Document root cause

3. **Data recovery**:
   - Restore from localStorage backups
   - Re-run migration with fixes
   - Verify data integrity

## Communication Plan

### Stakeholders
- **Development Team**: Daily updates in standup
- **QA Team**: Notify before each phase
- **Product Team**: Weekly progress reports
- **Tenant Admins**: Email notification before production deployment

### Key Messages
- "We're upgrading landing page management for better reliability"
- "You'll gain version control and rollback capability"
- "No disruption to existing landing pages"
- "New editor available after migration"

## Documentation Updates Required

- [x] ARCHITECTURE_DECISION_RECORD_LANDING_PAGE_CMS.md (created)
- [x] LANDING_PAGE_CMS_GUIDE.md (created)
- [x] ARCHITECTURE_SAFEGUARDS_LANDING_PAGE.md (created)
- [x] .github/copilot-instructions.md (updated)
- [ ] README.md (add Landing Page CMS section)
- [ ] CHANGELOG.md (document changes)
- [ ] apps/tenant-app/README.md (update for admins)

## Team Training

### Required Training
- [ ] Backend API overview (for backend devs)
- [ ] React hook usage (for frontend devs)
- [ ] Version control concepts (for all devs)
- [ ] Migration process (for DevOps)

### Training Materials
- [x] API documentation (`LANDING_PAGE_CMS_GUIDE.md`)
- [x] Architecture decision record
- [ ] Video walkthrough (to be created)
- [ ] Interactive demo (to be created)

## Timeline

- **Phase 1**: November 25, 2024 ✅ COMPLETE (3 hours)
- **Phase 2**: November 25-26, 2024 🔄 IN PROGRESS (6 hours estimated)
- **Phase 3**: November 27-28, 2024 ⏳ PENDING (8 hours estimated)
- **Phase 4**: November 29, 2024 ⏳ PENDING (4 hours estimated)
- **Phase 5**: December 2-3, 2024 ⏳ PENDING (4 hours estimated)

**Total Estimated Effort**: 25 hours  
**Completion Target**: December 3, 2024

---

**Last Updated**: November 25, 2024  
**Owner**: Development Team  
**Status**: 40% Complete (Backend done, Frontend in progress)
