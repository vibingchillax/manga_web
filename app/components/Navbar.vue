<template>
  <div class="navbar-wrap flex flex-col transparent fixed top-0 right-0">
    <div class="nav-bar-main flex justify-center">
      <div class="nav-bar flex flex-grow justify-end w-full items-center gap-2">
        <!-- Logo  -->
        <!-- Announcement -->
         <SearchBar/>
        <!-- User -->
      </div>
      <div class="navbar-background" style="opacity: 0;"></div>
    </div>
  </div>
  <div class="h-[var(--navbar-height)]"></div>
</template>
<style lang="css" scoped>
.navbar-wrap {
  --nav-anim-attr: .15s ease-in-out;
  transition: margin var(--nav-anim-attr), transform 75ms ease-out;
  width: 100%;
  z-index: 6;
}

.nav-bar-main {
  max-height: var(--navbar-height);
  min-height: var(--navbar-height);
}

.nav-bar {
  max-width: 1440px;
  padding-left: var(--side-margin);
  padding-right: var(--side-margin);
  z-index: 1;
}
</style>