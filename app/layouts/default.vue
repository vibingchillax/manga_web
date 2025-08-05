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
<style lang="css" scoped>
.content > * {
    margin-bottom: 2rem;
    margin-bottom: calc(var(--bottom-nav-area) + var(--botton-margin));
    margin-top: 0;
    margin-top: var(--top-margin);
    padding-left: var(--side-margin);
    padding-right: var(--side-margin);
}
</style>