<template>
    <div class="flex flex-grow">
        <Sidebar />
        <div class="flex flex-col flex-grow" style="min-width: 0px;">
            <Navbar />
            <div class="content flex-grow">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<style lang="css">
.content > * {
    margin-bottom: 2rem;
    margin-bottom: calc(var(--bottom-nav-area) + var(--botton-margin));
    margin-top: 0;
    margin-top: var(--top-margin);
    padding-left: var(--side-margin);
    padding-right: var(--side-margin);
}
.layout-container {
    display: grid;
    position: relative;
  --banner-overlap: calc(var(--navbar-height) + var(--top-margin));
  --banner-top: calc(var(--banner-overlap)*-1);
}

.banner-container {
    clip: rect(0, auto, auto, 0);
    clip-path: inset(0 0);
    left: 0;
    position: absolute;
    right: 0;
    top: var(--banner-top);
    width: auto;
    z-index: -1
}

.banner-container {
  height: calc(var(--banner-height) + var(--banner-overlap))
}

.banner-container>.banner-shade {
    -webkit-backdrop-filter: var(--banner-filter);
    backdrop-filter: var(--banner-filter);
    background: var(--banner-overlay-gradient);
    bottom: 0;
    height: auto;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    width: auto
}

.banner-image {
    background-position: center 25%;
    background-size: cover;
    position: fixed;
    transition: width .15s ease-in-out;
    width: 100%
}

.banner-image {
  height: calc(var(--banner-height) + var(--banner-overlap));
}
</style>