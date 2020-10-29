require 'fileutils'

# Copies the packed JavaScript package into each fixture directory for use
def copy_fixture_packages
  package = 'bugsnag-source-maps.tgz'
  throw Error.new("#{package} not found.") unless File.exist?(package)
  Dir.entries('features/fixtures').reject { |entry| %w[. ..].include?(entry) }.each do |entry|
    target_dir = "features/fixtures/#{entry}"
    if File.directory?(target_dir)
      `cp #{package} #{target_dir}`
    end
  end
end

AfterConfiguration do |_config|
  copy_fixture_packages
end

Before do
  Docker.compose_project_name = "#{rand.to_s}:#{Time.new.strftime("%s")}"
  Runner.environment.clear
  Runner.environment["BUGSNAG_API_KEY"] = '123123123123123'
  Runner.environment["BUGSNAG_ENDPOINT"] = "http://localhost:9339"
end
