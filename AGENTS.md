# Copilot Guidance for RouteScout

Concept
I want to build a web application to help a local scouts’ group plan and execute the yearly collection of Christmas trees.

Purpose
Provide upfront architectural and coding conventions so AI assistants (and humans) generate code consistent with the existing solution.

Tech Stack
- Backend: ASP.NET Core (net9.0), Marten 8.14 (PostgreSQL), Npgsql, Minimal APIs, Swashbuckle for OpenAPI.
- Patterns: Event-driven (domain events + projection documents), Background services.
- Frontend: React + TypeScript (Vite), component feature folders.

Solution Structure (Backend)
- RouteScout.sln: Solution file. It's in the root of the repository, right next to this file.
- RouteScout.AddressWashing: Address candidate intake, washing services, events (`AddressAdded`, confirmations/rejections), projections (`AddressCandidateSummary`).
- RouteScout.Routes: Route + Stop domain (events like `StopCreated`, `StopUnassignedFromRoute`), projections (`StopSummary`).
- RouteScout.Payments: Payment domain (confirmation triggers address creation).
- RouteScout.Web/RouteScout.Web.Server: Composition root (`Program.cs`), integration handlers wiring domains.

Domain Conventions
- AddressCandidate progresses through washing -> confirmed/rejected.
- Confirmed address can create a Stop; rejected resets payment state.
- Stops may be assigned/unassigned to Routes; use events for lifecycle.

Event & Handler Conventions
- Domain events are immutable records in `Domain/Events` folders.
- Handlers live in `Integration/<Domain>` folders; name: <Trigger><Action>Handler (e.g., `PaymentConfirmedAddAddressHandler`).
- Prefer async methods; avoid blocking calls.
- Publish events then perform side-effects in handlers (do not mix domain mutation + external concerns).

Persistence (Marten)
- Use documents for aggregates & projections. Keep projections in `Projections/*` with summary read models suffixed `Summary`.
- ID Strategy: Use Guid for aggregate identity unless domain-specific value object is needed.
- Keep query interfaces small; expose methods on Services (e.g., `IStopService`).

Services
- Service interfaces in `Services` (prefix I, suffix Service). Implement coordination, not complex business logic inline in controllers.
- Background processing: derive from hosted services only in Web.Server; other projects expose pure services.

API / Endpoint Conventions
- Extension classes: `EndpointExtensions` to map endpoints per domain. Keep them slim: validation -> service call -> result.
- DTOs live under `Controllers/Dto` or `Dto` folders; suffix with action (`AddAddressDto`, `CreateStop`). Use required properties with `required` where possible (net9/C# features).
- Return ProblemDetails for errors; prefer 404 for missing resources, 400 for validation.

C# Coding Standards
- nullable enabled; never disable per file.
- Use `record` for immutable events & simple DTOs; `class` for entities/services.
- Use expression-bodied members where trivial.
- Prefer `async Task` over `async void` (except event handlers for UI which we do not have on server).
- Inject via constructor only; avoid service locator.

Transaction / Consistency
- Operations that create multiple domain objects should publish events; projections catch up for read models.
- Avoid cross-domain direct calls; use handlers reacting to events.

Logging
- Log at information level for state transitions (confirmed, rejected, created). Debug for internal details. No sensitive data.

Frontend (React + TS)
- Feature folder structure: `features/<domain>/{components,pages,types}`.
- Components: Use PascalCase. Keep state local; lift shared state to page-level.
- Types: use interface names suffixed without DTO (e.g., `AddressCandidate`), mirroring backend summaries.
- Prefer hooks for data fetching; centralize API calls (future improvement: add `/src/api` module).

Naming
- Events: <Entity><PastTense> (StopCreated). Avoid ambiguous verbs.
- Handlers: <Source><Outcome><Target>Handler (PaymentConfirmedAddAddressHandler).
- Services: <Entity/Process>Service.

Testing (Future)
- Unit test services and event handlers with in-memory Marten or mocks.
- Snapshot tests for projections.

When Adding New Features
1. Define aggregate + events in appropriate domain project.
2. Add projection summaries if read concerns exist.
3. Create service interface + implementation.
4. Map endpoints via `EndpointExtensions`.
5. Add integration handler only when reacting across domains.
6. Update frontend type & component within feature folder.

Avoid
- Direct DB access outside Marten session abstraction.
- Fat controllers or pages with domain logic.
- Circular project references.

Security & Validation
- Validate incoming DTOs (basic format, required fields). Consider FluentValidation later.
- Sanitize user-provided address text before persistence.

Performance
- Batch queries for summaries; avoid N+1 by projecting lists.

Checklist for Copilot Suggestions
- Is the code placed in correct domain project?
- Does it follow naming conventions above?
- Are events immutable records?
- Is async/await used properly?
- Are nullability annotations respected?

Coding style
- Use "is null"" and "is not null" for null checks.
- Use pattern matching where applicable.
- Create classes in separate files.

Keep this file updated as architecture evolves.
