# svelte-css

A Svelte preprocessor making dynamic styles easier to use.

### Important!

This preprocessor is still under development and currently doesn't support all css features, like `@media` and such. Use with caution, and report any problems and broken css features.

## Usage

### Using variables inside css:

```svelte
<!-- Flex.svelte -->
<script>
    import { css } from "svelte-css";
    export let direction: "column" | "row" = "row";
</script>

<div>
    <slot />
</div>

{css`
    div {
        display: flex;
        flex-direction: ${direction};
    }
`}
```

### Referencing Svelte components in css:

```svelte
<!-- Box.svelte -->
<script>
    import { css } from "svelte-css";
    export let color = "red";
</script>

<Flex>
    <slot />
</Flex>

${css`
    ${Flex} {
        background-color: ${color};
    }
`}
```

In order for **svelte-css** to know which html-tag we actually want to target when we write `${Flex}`, we need to add `{ ...cssTarget }` on the target tag inside `Flex.svelte`:

```svelte
<!-- Flex.svelte -->
<script>
    import { css, cssTarget } from "svelte-css";
    export let direction: "column" | "row" = "row";
</script>

<div { ...cssTarget }>
    <slot />
</div>

{css`
    div {
        display: flex;
        flex-direction: ${direction};
    }
`}
```

## How does it work?

There is no magic. This is a simple preprocessor, turning your css code into a `<style>` or `<svelte:element this="style">` tag, depending on if your css is "dynamic" or not.

This...

```svelte
{css`
    ${Component} > div {
        width: ${200 + 300}px;
        height: 200px;
    }

    div {
        background-color: red;
    }
`}
```

gets transformed into this:

```svelte
<style>
    /* Component identifiers */ > /* div identifiers */ {
        height: 200px;
    }
    /* div identifiers */ {
        background-color: red;
    }
</style>

<svelte:element this="style">
{`
    ${/* Component identifiers */} > ${/* div identifiers */} {
        width: ${200 + 300}px;
    }
`}
</svelte:element>
```

The preprocessor knows when you're using dynamic or static properties and splits them into `<style>` or `<svelte:element this="style">` accordingly. Static properties get put into the `<style>`-tag, while dynamic properties go to into the `<svelte:element>`-tag.

This way, the css inside `<svelte:element>` gets dynamically updated each time its dependencies change, while the `style`-tag stays static at all times.
