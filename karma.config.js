module.exports = function(config) {
  config.set({
    browsers: ["Chrome"],
    frameworks: ["browserify", "jasmine"],
    files: [
      "./api/**/*.js",
      "./test/**/*.spec.js"
    ],
    preprocessors: {
      "./api/**/*.js": ["browserify"],
      "./test/**/*.spec.js": ["browserify"]
    },
    browserify: {
      debug: true,
      transform: [
        ["babelify",
          {
            presets: ["es2015", "stage-1"]
          }
        ]
      ]
    }
  });
};
