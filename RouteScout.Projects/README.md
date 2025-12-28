# RouteScout.Projects - Project Management Module

## Overview
The RouteScout.Projects module provides project management functionality for the RouteScout application. Projects serve as the top-level organizational unit that contains all routes, stops, teams, payments, and address washing data.

## Project Structure

### Domain
- **Project.cs** - The Project aggregate root with event sourcing
  - Properties:
    - `Guid Id` - Unique project identifier
    - `string Name` - Project name
    - `List<Guid> OwnerIds` - List of user/owner IDs who have access to this project
    - `DateTimeOffset CreatedAt` - Project creation timestamp

### Events
- **ProjectCreated** - Raised when a new project is created
- **ProjectRenamed** - Raised when a project's name is changed
- **OwnerAdded** - Raised when an owner is added to a project
- **OwnerRemoved** - Raised when an owner is removed from a project

### Projections
- **ProjectSummary** - Read model for querying projects

### DTOs
- **CreateProject** - Request DTO for creating a new project
- **RenameProject** - Request DTO for renaming a project

## API Endpoints

All project endpoints are under `/api/projects` (NOT scoped by projectId since these manage projects themselves):

### Create Project
```http
POST /api/projects
Content-Type: application/json

{
  "name": "Christmas Tree Collection 2024",
  "ownerIds": ["user-guid-1", "user-guid-2"]
}

Response: 201 Created
{
  "id": "project-guid",
  "name": "Christmas Tree Collection 2024"
}
```

### Get All Projects
```http
GET /api/projects

Response: 200 OK
[
  {
    "id": "project-guid",
    "name": "Christmas Tree Collection 2024",
    "ownerIds": ["user-guid-1", "user-guid-2"],
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

### Get Project by ID
```http
GET /api/projects/{projectId}

Response: 200 OK
{
  "id": "project-guid",
  "name": "Christmas Tree Collection 2024",
  "ownerIds": ["user-guid-1", "user-guid-2"],
  "createdAt": "2024-01-15T10:00:00Z"
}
```

### Rename Project
```http
PATCH /api/projects/{projectId}/name
Content-Type: application/json

{
  "newName": "Tree Collection 2025"
}

Response: 200 OK
```

### Add Owner
```http
POST /api/projects/{projectId}/owners/{ownerId}

Response: 200 OK
```

### Remove Owner
```http
DELETE /api/projects/{projectId}/owners/{ownerId}

Response: 204 No Content
```

## Integration with Other Modules

The Projects module is independent but provides the `projectId` that all other modules use for data isolation:

- **RouteScout.Routes** - Routes, stops belong to a project
- **RouteScout.Teams** - Teams are scoped to a project
- **RouteScout.Payments** - Payments are imported per project
- **RouteScout.AddressWashing** - Address candidates belong to a project

## Usage Flow

1. **Create a Project**
   ```
   POST /api/projects
   { "name": "My Project", "ownerIds": [...] }
   ```
   Returns project ID: `550e8400-e29b-41d4-a716-446655440000`

2. **Use Project ID in Other APIs**
   ```
   POST /api/projects/550e8400-e29b-41d4-a716-446655440000/routes
   GET  /api/projects/550e8400-e29b-41d4-a716-446655440000/stops
   POST /api/projects/550e8400-e29b-41d4-a716-446655440000/payments/import
   ```

3. **Manage Project**
   ```
   PATCH /api/projects/550e8400-e29b-41d4-a716-446655440000/name
   POST  /api/projects/550e8400-e29b-41d4-a716-446655440000/owners/{userId}
   ```

## Setup Instructions

### 1. Add Project to Solution (if using .sln file)

If you have a solution file, run:
```bash
dotnet sln add RouteScout.Projects/RouteScout.Projects.csproj
```

### 2. Restore and Build

```bash
dotnet restore
dotnet build
```

The project is already referenced in `RouteScout.Web.Server.csproj` and registered in `Program.cs`.

### 3. Database Migration

The Marten event store will automatically create the necessary tables when the application starts with `AutoCreate.All`.

## Files Created

```
RouteScout.Projects/
??? RouteScout.Projects.csproj
??? Domain/
?   ??? Project.cs
?   ??? Events/
?       ??? ProjectCreated.cs
?       ??? ProjectRenamed.cs
?       ??? OwnerAdded.cs
?       ??? OwnerRemoved.cs
??? Projections/
?   ??? ProjectSummary.cs
??? Dto/
?   ??? CreateProject.cs
?   ??? RenameProject.cs
??? Extensions/
    ??? EndpointExtensions.cs
    ??? MartenExtensions.cs
    ??? ServiceExtensions.cs
```

## Next Steps

1. **Authentication/Authorization** - Add user authentication and verify owners have access
2. **Project Deletion** - Add soft delete or archive functionality
3. **Project Settings** - Add additional metadata (description, deadline, budget, etc.)
4. **Owner Permissions** - Implement role-based permissions (admin, viewer, editor)
5. **Project Dashboard** - Create aggregate views showing project statistics
