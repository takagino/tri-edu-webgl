import restart from 'vite-plugin-restart'

export default {
    root: 'src/',
    base: "./",
    publicDir: '../static/',
    server:
    {
        host: true,
        open: true,
    },
    build:
    {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true,
    },
    plugins:
    [
        restart({ restart: [ '../static/**', ] }),
    ],
}
