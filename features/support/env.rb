def copy_package
  raise "bugsnag-source-maps.tgz not found." unless File.exist?("/app/build/bugsnag-source-maps.tgz")

  Dir['features/fixtures/*/'].each do |entry|
    target_dir = "#{entry}/build"

    raise "#{target_dir} does not exist" unless File.directory?(target_dir)

    puts "Copying bugsnag-source-maps.tgz into #{target_dir}"
    `cp /app/build/bugsnag-source-maps.tgz #{target_dir}`
  end
end

AfterConfiguration do |_config|
  copy_package

  Maze.config.file_log = false
  Maze.config.log_requests = true
end

Before do
  Maze::Docker.compose_project_name = "#{rand.to_s}:#{Time.new.strftime("%s")}"
end
