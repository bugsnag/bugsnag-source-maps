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
end

Before do
  # This is a bit of a hack to let us record the last command's exit code for
  # asserting against. This module redefines 'run_docker_compose_command' and then
  # gets called before the real 'run_docker_compose_command' because it is
  # prepended (see Module#prepend). This lets us record the last exit code, which
  # should always be the actual command we run in the tests
  # There is possibility for tests to interfere with each other, but only if they
  # don't run commands themselves. In which case, why would they care about the
  # last exit code??
  module RecordExitCode
    attr_reader :last_exit_code

    def run_docker_compose_command(...)
      raise "You can't use RecordExitCode without a super class!" unless defined?(super)

      _output, @last_exit_code = super(...)
    end
  end

  class Docker
    class << self
      prepend RecordExitCode
    end
  end

  Docker.compose_project_name = "#{rand.to_s}:#{Time.new.strftime("%s")}"
end
