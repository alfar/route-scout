# .NET 10.0 Upgrade Plan

## Execution Steps

Execute steps below sequentially one by one in the order they are listed.

1. Validate that an .NET 10.0 SDK required for this upgrade is installed on the machine and if not, help to get it installed.
2. Ensure that the SDK version specified in global.json files is compatible with the .NET 10.0 upgrade.
3. Upgrade RouteScout.Payments\RouteScout.Payments.csproj
4. Upgrade RouteScout.Web\RouteScout.Web.Server\RouteScout.Web.Server.csproj
5. Upgrade RouteScout.Web\routescout.web.client\routescout.web.client.esproj
6. Upgrade RouteScout.AddressWashing\RouteScout.AddressWashing.csproj
7. Upgrade RouteScout.Routes\RouteScout.Routes.csproj
8. Upgrade RouteScout.Teams\RouteScout.Teams.csproj

## Settings

This section contains settings and data used by execution steps.

### Excluded projects

Table below contains projects that do belong to the dependency graph for selected projects and should not be included in the upgrade.

| Project name                                   | Description                 |
|:-----------------------------------------------|:---------------------------:|

### Project upgrade details
This section contains details about each project upgrade and modifications that need to be done in the project.

#### RouteScout.Payments\RouteScout.Payments.csproj modifications

Project properties changes:
  - Target framework should be changed from `net9.0` to `net10.0`

#### RouteScout.Web\RouteScout.Web.Server\RouteScout.Web.Server.csproj modifications

Project properties changes:
  - Target framework should be changed from `net9.0` to `net10.0`

#### RouteScout.Web\routescout.web.client\routescout.web.client.esproj modifications

Project properties changes:
  - Target framework should be changed from `.NETFramework,Version=v4.7.2` to `net10.0`

#### RouteScout.AddressWashing\RouteScout.AddressWashing.csproj modifications

Project properties changes:
  - Target framework should be changed from `net9.0` to `net10.0`

#### RouteScout.Routes\RouteScout.Routes.csproj modifications

Project properties changes:
  - Target framework should be changed from `net9.0` to `net10.0`

#### RouteScout.Teams\RouteScout.Teams.csproj modifications

Project properties changes:
  - Target framework should be changed from `net9.0` to `net10.0`