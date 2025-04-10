module.exports = {
    jest: {
        configure: {
            transform: {
                "^.+\\.[tj]sx?$": "babel-jest",
            },
            transformIgnorePatterns: [
                "node_modules/(?!(axios)/)"
            ],
        },
    },
};
