Then("the Content-Type header is valid multipart form-data") do
  expected = /^multipart\/form-data; boundary=--------------------------\d+$/
  actual = Server.current_request[:request]["content-type"]

  assert_match(expected, actual)
end

def read_expected_file(fixture, file_name)
  path = "#{__dir__}/../expected/#{fixture}/#{file_name}"

  assert_true(File.exists?(path), "The file '#{file_name}' does not exist at '#{path}'")

  File.read(path)
end

def get_form_data_as_string(field)
  form_data = read_key_path(Server.current_request[:body], field)

  assert_instance_of(
    WEBrick::HTTPUtils::FormData,
    form_data,
    "Expected the payload value for '#{field}' to be an instance of 'WEBrick::HTTPUtils::FormData' but it was a '#{form_data.class}'"
  )

  form_data.to_s
end

def assert_payload_fields_match(field, expected, actual)
  result = value_compare(expected, actual)

  assert_true(
    result.equal?,
    "The payload field '#{field}' does not match the fixture:\n #{result.reasons.join('\n')}"
  )
end

Then("the payload field {string} matches the expected source map for {string}") do |field, fixture|
  expected = JSON.parse(read_expected_file(fixture, "source-map.json"))
  actual = JSON.parse(get_form_data_as_string(field))

  assert_payload_fields_match(field, expected, actual)
end

Then("the payload field {string} matches the expected minified file for {string}") do |field, fixture|
  expected = read_expected_file(fixture, "minified-file.js").chomp
  actual = get_form_data_as_string(field)

  assert_payload_fields_match(field, expected, actual)
end
