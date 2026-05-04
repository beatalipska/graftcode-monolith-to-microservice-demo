# Graftcode Architecture Evolution Demo

This demo explores a small architecture evolution question:

Can a small modular app start as a modular monolith, then extract one module into a separate service in a few steps, without rewriting the order flow?

The business example is intentionally simple:

- `catalog`
- `pricing`
- `orders`

Graftcode is still in alpha, with beta coming soon, so the point here is not to claim we solved architecture. The point is to test a shape that looks promising on a concrete flow.

## What This Demo Is Testing

The order flow is:

```text
orders.createOrder(productId, quantity, customerType)
  -> catalog.getProduct(productId)
  -> pricing.calculatePrice(productId, quantity, customerType)
  -> order summary
```

We run that flow in two Docker-based deployment shapes:

1. **Monolith mode**  
   `catalog`, `pricing`, and `orders` are hosted behind one Graftcode Gateway in one container.

2. **Distributed mode**  
   `pricing` is hosted behind its own Gateway in one container, while `catalog + orders` are hosted behind a second Gateway in another container.

The thing we care about is not “can we create an order?” The thing we care about is whether extracting `pricing` starts to feel like:

1. host the extracted module
2. install the generated Graft
3. point configuration at `inMemory` or `ws://.../ws`
4. run the same order flow again

That is much closer to a few setup steps than to a migration project.

## Why Architecture Evolution Is Often Expensive

Moving one module into its own service usually means more than a deployment change.

Teams often end up adding or changing:

- the API layer between modules
- endpoints and client libraries
- request/response models
- serialization rules
- timeout and error handling around every call
- deployment wiring
- test setup

That cost is often why teams either split too early or postpone extraction longer than they want.

This repo explores whether the cost can be smaller when the integration boundary starts from typed method calls instead of a hand-built service API.

## What Usually Changes When A Module Becomes A Service

In a more traditional move, extracting `pricing` would usually introduce:

- a new service project
- new endpoints around pricing operations
- new client code inside the orders app
- new transport payload models
- extra code paths for local and remote execution

That is the part we are trying to keep small here.

## What Stayed The Same Here

The center of the demo is [orders.js](/Users/beatalipska/Code/graftcode-demo/architecture-evolution/app/src/orders.js).

`orders.createOrder(...)` still:

1. gets product data from catalog
2. asks pricing to calculate the total
3. returns an order summary

The business flow stays the same. The main thing that changes is where `pricing` runs and how it is wired in.

In the distributed shape, the app side uses the generated Graft contract:

- `@graft/npm-architecture-evolution-pricing`
- `GraftConfig.setConfig(process.env.GRAFT_CONFIG)`
- typed calls through `PricingService.calculatePrice(...)`

That is the part that looks worth testing further.

## Project Structure

```text
app/src/catalog.js
app/src/pricing.js
app/src/orders.js

monolith-service/
  index.js
  package.json
  Dockerfile

pricing-service/
  index.js
  package.json
  Dockerfile

app-service/
  index.js
  package.json
  Dockerfile

scripts/run-monolith.sh
scripts/setup-remote-pricing.sh
scripts/run-distributed.sh
scripts/stop-demo.sh
```

The Docker services map to the architecture story:

- `monolith-service/` hosts the whole app in one Gateway
- `pricing-service/` hosts the extracted pricing module
- `app-service/` hosts `catalog + orders` and calls pricing through the generated Graft

## How To Run Monolith Mode

Start the modular monolith behind one Gateway:

```bash
cd architecture-evolution
./scripts/run-monolith.sh
```

Or:

```bash
npm run run:monolith
```

What you get:

- one Docker container
- one Graftcode Gateway
- one Vision UI at:

```text
http://localhost:18081/GV
```

From Vision, call:

```text
OrdersService.createOrder
```

Suggested values:

```text
productId: prod_2002
quantity: 12
customerType: vip
```

## How To Run Distributed Mode

Start the extracted pricing service and then the app container:

```bash
cd architecture-evolution
./scripts/run-distributed.sh
```

Or:

```bash
npm run run:distributed
```

The distributed script does this:

1. creates a shared Docker network
2. builds and runs the pricing Gateway container
3. reads the generated install command from pricing Gateway logs
4. tries to install the generated pricing Graft into `app-service`
5. builds and runs the app Gateway container with `GRAFT_CONFIG`

If the generated package install works, you get:

- pricing Vision at:

```text
http://localhost:19091/GV
```

- app Vision at:

```text
http://localhost:28081/GV
```

From the app Vision, call:

```text
OrdersService.createOrder
```

The business flow should look the same, but pricing now runs across a deployment boundary.

## Current Alpha Note

This repo is wired for the real Graft path, but in this workspace the generated npm install step is still flaky.

Right now we see a real alpha blocker:

- the pricing Gateway starts correctly
- it prints a generated npm install command
- the install can still fail with `ETARGET`

We also saw the same kind of failure on the older `js-energy-platform` sample, so this does not look unique to this demo.

That is worth showing honestly.

The architecture shape still looks interesting. The generated local package install flow still needs validation.

## Optional Local Inspection Path

There is still a local fallback path in the repo for quick code inspection:

```bash
npm run distributed:standin
```

That is not the main story anymore. The main story is the Docker-based monolith and Docker-based distributed shape.

## What Looks Promising

What looks promising here is fairly specific:

- the order flow stays easy to read
- `orders.createOrder(...)` does not need a separate version for local and remote
- the extracted module has its own Gateway and its own container
- the app side can be pointed at `inMemory` or `ws://.../ws` through `GRAFT_CONFIG`
- the deployment boundary becomes much more visible without forcing an order-flow rewrite

That does not prove architecture migration is suddenly easy. It just suggests that extracting one module might become much more operational than code-heavy.

## Open Questions / What Still Needs Validation

Things still worth testing next:

- how stable the generated package install flow is in alpha
- how smooth the generated Graft update loop feels day to day
- what happens when pricing method signatures change
- auth and service identity across the boundary
- retries and timeouts
- tracing across app and pricing containers
- whether the same shape still feels good with two or three extracted modules
- when an async boundary would be a better fit than request-response

If this resonates, the useful next step is not “looks cool.” The useful next step is: tell us where this gets awkward in a real system.

Helpful references:

- [Quick Start Guide](https://academy.graftcode.com/quick-start)
- [Switch Between Monolith And Microservices (JavaScript)](https://academy.graftcode.com/quick-start/switch-between-monolith-and-microservices/javascript)
- [Graftcode overview](https://graftcode.com)
