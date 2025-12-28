# Project Scoping Implementation

## Overview
This implementation adds project isolation to the RouteScout application, allowing multiple tree collection projects to run side by side without data getting mixed up.

## Solution Architecture

### Approach: ProjectId Property Pattern
Each aggregate root now includes a `ProjectId` property that is set when the aggregate is created and included in the creation event. All queries filter by `ProjectId` to ensure data isolation.

### URL Structure
All API endpoints are now scoped under `/api/projects/{projectId:guid}/`, implemented using ASP.NET Core's MapGroup feature in `Program.cs`:

```
/api/projects/{projectId:guid}/address-candidates
/api/projects/{projectId:guid}/payments
/api/projects/{projectId:guid}/routes
/api/projects/{projectId:guid}/stops
/api/projects/{projectId:guid}/teams
```

## Changes by Domain

### 1. AddressWashing Domain
**Files Modified:**
- `AddressAdded.cs` - Added `ProjectId` parameter
- `AddressCandidate.cs` - Added `ProjectId` property
- `AddressCandidateSummary.cs` - Added `ProjectId` property
- `AddressCandidateService.cs` - Added `projectId` parameter to `AddAddressCandidateAsync`
- `IAddressCandidateService.cs` - Updated interface
- `AddressWashingController.cs` - Added `projectId` route parameter, filters queries by project

### 2. Payments Domain
**Files Modified:**
- `PaymentImported.cs` - Added `ProjectId` parameter
- `Payment.cs` - Added `ProjectId` property, updated factory method
- `PaymentSummary.cs` - Added `ProjectId` property
- `PaymentService.cs` - Added `projectId` parameter to `ImportCsv`, scopes duplicate detection by project
- `EndpointExtensions.cs` - Added `projectId` route parameter, filters queries by project

### 3. Routes Domain
**Files Modified:**
- `RouteCreated.cs` - Added `ProjectId` parameter
- `Route.cs` - Added `ProjectId` property
- `RouteSummary.cs` - Added `ProjectId` property
- `StopCreated.cs` - Added `ProjectId` parameter
- `Stop.cs` - Added `ProjectId` property
- `StopSummary.cs` - Added `ProjectId` property
- `StopService.cs` - Added `projectId` parameter to `CreateStop`
- `IStopService.cs` - Updated interface
- `EndpointExtensions.cs` - Added `projectId` route parameter, filters queries by project

### 4. Teams Domain
**Files Modified:**
- `TeamCreated.cs` - Added `ProjectId` parameter
- `Team.cs` - Added `ProjectId` property
- `TeamSummary.cs` - Added `ProjectId` property
- `TeamService.cs` - Added `projectId` parameter to `CreateTeam`, counts teams within project
- `ITeamService.cs` - Updated interface
- `EndpointExtensions.cs` - Added `projectId` route parameter, filters queries by project

### 5. Issues Domain
**Files Modified:**
- `IssueCreated.cs` - Added `ProjectId` parameter
- `Issue.cs` - Added `ProjectId` property
- `IssueSummary.cs` - Added `ProjectId` property
- `IssueService.cs` - Added `projectId` parameter to `CreateIssue`

### 6. Integration Handlers
**Files Modified:**
- `AddressConfirmedAddStopHandler.cs` - Passes `ProjectId` from candidate to stop creation
- `PaymentConfirmedAddAddressHandler.cs` - Passes `ProjectId` from payment to address candidate creation

### 7. Main Application
**Files Modified:**
- `Program.cs` - Uses `MapGroup("/api/projects/{projectId:guid}")` to scope all main endpoints

## How It Works

### Project Creation Flow
1. When creating a new aggregate (Route, Stop, Team, AddressCandidate, Payment), the `projectId` is passed from the URL route parameter
2. The creation event includes the `projectId`
3. The aggregate's Apply method sets the `ProjectId` property from the event
4. Projections also capture the `ProjectId`

### Project Filtering Flow
1. Client calls API with project ID in URL: `/api/projects/{projectId}/routes`
2. ASP.NET Core route binding extracts `projectId` as a `Guid` parameter
3. Endpoint handlers receive `projectId` and filter queries: `.Where(r => r.ProjectId == projectId)`
4. Only data for that specific project is returned

### Example API Calls

**Create a Route:**
```http
POST /api/projects/550e8400-e29b-41d4-a716-446655440000/routes
{
  "areaId": "...",
  "areaName": "Downtown",
  "dropOffPoint": "City Hall"
}
```

**Get Routes for a Project:**
```http
GET /api/projects/550e8400-e29b-41d4-a716-446655440000/routes
```

**Import Payments for a Project:**
```http
POST /api/projects/550e8400-e29b-41d4-a716-446655440000/payments/import
Content-Type: multipart/form-data
[CSV file]
```

## Benefits

1. **Data Isolation**: Projects cannot accidentally access each other's data
2. **URL Clarity**: Project context is clear from the URL structure
3. **Simple Filtering**: One WHERE clause filters all queries
4. **Type Safety**: ProjectId is strongly typed as Guid
5. **Event Sourcing Compatible**: ProjectId is immutable after creation
6. **Centralized Configuration**: All route scoping done in Program.cs

## Migration Considerations

?? **Important**: This is a breaking change for existing data!

Existing data in the database will NOT have a `ProjectId` set. You'll need to either:

1. **Clean Database**: Drop and recreate for new projects (recommended for development)
2. **Data Migration**: Write a migration script to set `ProjectId = Guid.Empty` or assign a default project ID to all existing records
3. **Gradual Migration**: Allow null `ProjectId` temporarily and migrate over time

## Next Steps

To use this implementation:

1. Create a Project management UI/API to generate new project IDs
2. Store project metadata (name, description, created date, etc.)
3. Consider adding project-level permissions/authorization
4. Update frontend to include project selector and use project-scoped URLs
