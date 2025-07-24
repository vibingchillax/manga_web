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