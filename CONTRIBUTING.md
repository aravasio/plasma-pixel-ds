# Contributing

This is an identity, not a component library. The bar for adding to it is high and
the bar for changing it is higher.

## Two questions any change has to answer

1. **What does this let a surface express that it could not before?** "It felt
   empty" is not an answer; emptiness is a layout problem.
2. **What is now ambiguous?** Every addition creates a decision someone has to make
   later. If a designer could reasonably pick either your new thing or an existing
   one, you have added ambiguity, not capability — write the rule that decides.

## Adding a component recipe

Recipes live in `core/COMPONENTS.md` and are written as relationships plus the
value at open density, never as one platform's code. State the flat default first
and the Mix application second, if any. If the component would carry the Mix, say
which single element does and confirm the surface has no other hero.

## Adding a colour

Only when a new rule or state needs one. Give it a semantic name and a token, not a
hue name; check it clears 4.5:1 against `void` if it will ever carry text, and 3:1
if it will only ever be a mark. Add it to `tokens.json` and regenerate.

## Adding motion

The inventory in `COMPONENTS.md` is closed at six entries. A seventh needs its
reason written in the file beside it, and it must not touch a property another
entry already animates on the same element — that is how the skew silently ate the
drift the first time.

## Adding an application

`apps/<name>/` with a spec that stands on its own: layout trees, an instance table
with every mixed element's size / tile / duration / ghost / skew, its copy, and
acceptance criteria that can be checked without seeing the screen. Pin the core
version you designed against.

## Changing the core

Read `VERSIONING.md` first. If your change is on the major list, open an issue
before writing code — the cost is every existing surface, not this repo.

## Prototypes

The `.dc.html` files are visual references, not production code. They vendor a
runtime (`support.js`) so they open straight from the filesystem. Do not import
them into an application, and do not treat their markup as the spec — the spec is
the markdown.
