#!/usr/bin/env ruby
require 'fileutils'

@root = File.expand_path(File.join(File.dirname(__FILE__), ".."))

@default_project = "Project"
@projects = {
  "Project" => {
    "minify"     => true,
    # The final compiled file
    "build_file" => "project.js",
    # List all sources here. Ordering may matter for dependencies
    "srcs"       => [
                      "Util.js",
                      "Main.js",
                    ],
    # Indentation to apply to all code added to the project (so it fits neatly into the closure)
    "indent_all" => '  ',
    # Default prefix, wraps the project in a closure and drops the main object
    # into the global variable "Project"
    "prefix"     => '/*jslint bitwise: true, continue: true, nomen: true, plusplus: true, todo: true, white: true, browser: true, devel: true, indent: 2 */' + "\n" +
                    'var Project = (function (window, $) {' + "\n" +
                    '  "use strict";' + "\n\n",
    # Necessary bits to complete the default prefix
    "suffix"     => '  return Project;' + "\n" +
                    '}(window, jQuery));'
  }
}


def build(project)
  false if @projects.has_key?(project)

  build_file = File.join(@root, "build", @projects[project]["build_file"])
  FileUtils.touch(build_file)
  File.truncate(build_file, 0)

  File.open(build_file, 'a') do |f|
    if !@projects[project]["prefix"].nil?
      f << @projects[project]["prefix"]
    end

    @projects[project]["srcs"].each do |file|
      path = File.join(@root, "src", file)
      contents = File.open(path, 'rb').read

      if !@projects[project]["indent_all"].nil? && @projects[project]["indent_all"]
        contents.gsub!(/^(?!\n)/, @projects[project]["indent_all"])
      end

      f << contents
    end

    if !@projects[project]["suffix"].nil?
      f << @projects[project]["suffix"]
    end
  end

  if @projects[project]["minify"]
    minified_build_file = build_file.gsub(/\.js$/, "") + ".min.js"
    `jsmin < #{build_file} > #{minified_build_file}`
  end
end


to_build = ARGV.length > 0 ? ARGV : [@default_project]

to_build.each do |project|
  if @projects.has_key?(project)
    puts "-> Building .. #{project}"
    build project
  else
    puts "-> Error, there is no project '#{project}'."
  end
end
