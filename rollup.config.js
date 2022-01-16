import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'
import typescript from '@rollup/plugin-typescript'
import replace from '@rollup/plugin-replace'
// import configData from './env.js'
export default {
    input: "src/index.ts",
    output: {
        sourcemap: true,
        file: "dist/gitdb_bundle.js",
        format: "iife",
        name: 'gitdb',
        globals: {
        }
    },
    plugins: [
        json(),
        typescript({
            allowJs: true,
            target: 'es6',
            sourceMap: true,
        }),
        resolve({
            browser: true,
        }),
        commonjs({
            include: /node_modules/,
        }),
        replace({
            include: ['src/index.ts'],
            values: {
                // __gitxoption: JSON.stringify(configData)
            },
            preventAssignment: true,
        })
        
    ],
    watch: {
        exclude: 'node_modules/**'
    }
    // external: ['node-fetch']
}