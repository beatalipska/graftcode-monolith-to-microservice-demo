# Notes

## Main Engineering Takeaway

The promising part is not “we turned a monolith into microservices.”

The promising part is narrower:

- the modular monolith can be hosted as one Gateway in one container
- `pricing` can then be hosted behind its own Gateway in its own container
- the app side can call it through a generated Graft
- the `orders` business flow stays almost the same

That is the behavior worth testing.

## Where This Approach Seems Strongest

- small to medium internal module extractions
- teams that want a clear deployment boundary without rebuilding the whole integration layer
- cases where the business flow already reads naturally as typed method calls
- demos and early architecture experiments where you want the before/after to be easy to inspect

## Where It May Still Need Work

- generated package install reliability in local alpha
- contract evolution across multiple consumers
- auth and service identity
- tracing and debugging once several modules are distributed
- confidence that the “same client, different host” story stays smooth under real team use

## What A Skeptical Backend Engineer Would Likely Ask

- Is this really one config change, or is it one config change after a setup step that still has to be maintained?
- What breaks when the pricing interface changes?
- Where do retries, deadlines, and tracing live?
- How does auth work between app and extracted module?
- Does this make remote calls look too local?
- What happens once we extract two or three modules instead of one?
- When is a queue or event flow a better fit than a direct method call?
- How stable is the generated Graft install/update workflow today?

## What This Demo Proves

- a monolith-shaped container can host all three modules behind one Gateway
- pricing can be hosted as its own service behind a second Gateway
- the app side can be wired to the generated Graft contract
- the `orders` business flow does not need a separate rewrite just because `pricing` moved

## What It Does Not Prove

- that all architecture moves are cheap
- that a separate service is always the right answer
- that Graftcode alpha already covers every production case
- that generated client installation is fully stable in every local environment
- that this removes the need for retries, tracing, auth, or operational discipline

## What Should Be Tested Next In Alpha

- stable generated package installation from Gateway output
- same-image switching between `host=inMemory` and `host=ws://.../ws`
- a second extracted module
- auth plugins in a two-container setup
- tracing examples across both Gateways
- failure behavior when the extracted module is slow or unavailable
