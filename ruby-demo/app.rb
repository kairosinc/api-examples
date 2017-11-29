# app.rb
require "sinatra"
require "rest-client"
require "base64"
require "httparty"

api_url = "https://api.kairos.com"
app_id = "YOUR_APP_ID"
app_key = "YOUR_APP_KEY"

headers = {
    "app_id" => app_id,
    "app_key" => app_key
}
 
get "/" do
  File.read("views/index.html")
end

get "/detect" do
	@API_URL = api_url
	@APP_ID = app_id
	@APP_KEY = app_key
  	erb :detect
end

post "/detect/send-to-api" do
	url = api_url + "/detect"
	payload = request["imgObj"]
	return RestClient.post(url,payload,headers=headers)
end

get "/emotion" do
	@API_URL = api_url
	@APP_ID = app_id
	@APP_KEY = app_key
  	erb :emotion
end

post "/emotion/send-to-api" do
	if request["fname"] == "polling"	
		mediaId = request["mediaId"]
		url = api_url + "/v2/media/" + mediaId
		return RestClient.get(url,headers=headers)
	elsif request["fname"] == "analytics"
		mediaId = request["mediaId"]
		url = api_url + "/v2/analytics/" + mediaId
		return RestClient.get(url,headers=headers)
	elsif request["fname"] == "urlGetContent"
		urlPath = request["urlPath"]
		response = HTTParty.get(urlPath)
		contentLength = response.headers["content-length"]
		contentType = response.headers["content-type"]
		base64Str  = Base64.encode64(response.body)
		returnArray = {
		    "contentLength" => contentLength,
		    "contentType" => contentType,
		    "base64Str" => base64Str
		}
		return returnArray.to_json
	elsif request["fname"] == "urlProcess"
		mediaUrl = request["urlPath"]
		url = api_url + "/v2/media?source=" + mediaUrl + "&landmarks=1&timeout=1"
		return RestClient.post(url,"",headers=headers)
	elsif request["fname"] == "fileupload"
		@filename = params[:file][:filename]
		file = params[:file][:tempfile]
		filepath = "./public/tmp/#{@filename}"
		File.open(filepath, "wb") do |f|
		    f.write(file.read)
		end
		url = api_url + "/v2/media?landmarks=1"
		video = File.new(filepath, "rb")
		payload = {"source" => video}
		File.delete(filepath)
		return RestClient.post(url,payload,headers=headers)

	end
end

get "/recognize" do
	@API_URL = api_url
	@APP_ID = app_id
	@APP_KEY = app_key
  	erb :recognize
end

post "/recognize/send-to-api" do
	if request['process'] == "enroll"
		url = api_url + '/enroll'
		payload = request['imgObj']
		return RestClient.post(url,payload,headers=headers)
	end
	if request['process'] == "recognize"
		url = api_url + '/recognize'
		payload = request['imgObj']
		return RestClient.post(url,payload,headers=headers)
	end
end

get "/verify" do
	@API_URL = api_url
	@APP_ID = app_id
	@APP_KEY = app_key
  	erb :verify
end

post "/verify/send-to-api" do
	if request['process'] == "enroll"
		url = api_url + '/enroll'
		payload = request['imgObj']
		return RestClient.post(url,payload,headers=headers)
	end
	if request['process'] == "verify"
		url = api_url + '/verify'
		payload = request['imgObj']
		return RestClient.post(url,payload,headers=headers)
	end
end

# utility functions
# ExifData needs to be written

post "/exif-data" do
	return ""
end


	

