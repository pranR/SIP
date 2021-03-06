package net.soti.backend;

import com.joestelmach.natty.DateGroup;
import com.joestelmach.natty.Parser;
import org.joda.time.DateTime;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.net.URL;
import java.net.URLConnection;
import java.util.Calendar;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.text.DateFormat;
import java.text.SimpleDateFormat;

public class SporeReader {
	public static String rawtext;
	public static String rawTextLines[];
	public static String finalcoursecode;
	public static String currentyear;
	public static String session;
	public static String optionalcharacter = "";
	public static JSONObject obj;
	public static JSONArray nodeobj = new JSONArray();

	public static void main(String[] args) throws IOException {
		File courseFile = new File(args[0]);
		if (courseFile == null) {
			System.out.println("invalid path");
			System.exit(0);
		}
		PdfToText pdfManager = new PdfToText();
		String name = courseFile.getName();
		int pos = name.lastIndexOf(".");
		if (pos > 0) {
			name = name.substring(0, pos);
		}
		obj = new JSONObject();
		pdfManager.setFilePath(courseFile.toString());
		rawtext = pdfManager.ToText();
		obj.put("rawtext", rawtext);
		rawTextLines = rawtext.split("\\r?\\n");

		finalcoursecode = coursecodefinder();
		obj.put("code", finalcoursecode);
		obj.put("university", getUniversityCampus());
		JSONObject json = null;
		try {
			json = connecttoCobalt();
		} catch (Exception e) {
			e.printStackTrace();
			nodeobj.add(finalcoursecode);
			obj.put("graded_evaluations", getassignments());
			String returnpath = saveAsJSON(name);
			System.out.println(returnpath);
		}
		obj.put("id", json.get("id").toString());
		nodeobj.add(json.get("id").toString());
		obj.put("name", json.get("name").toString());
		obj.put("description", json.get("description").toString());
		obj.put("division", json.get("division").toString());
		obj.put("department", json.get("department").toString());
		obj.put("prerequisites", json.get("prerequisites").toString());
		obj.put("exclusions", json.get("exclusions").toString());
		obj.put("level", json.get("level").toString());
		obj.put("campus", json.get("campus").toString());
		obj.put("term", json.get("term").toString());
		obj.put("meeting_sections", changeTimesForMeetingSections((JSONArray) json.get("meeting_sections")));
		obj.put("graded_evaluations", getassignments());
		obj.put("office_hours", getOfficeHours());
		obj.put("office_location", getOfficeLocation());
		obj.put("semesterStart", getSemesterStart());
		obj.put("semesterEnd", getSemesterEnd());
		String returnpath = saveAsJSON(name);
		obj.put("mongodbevents", processeventsformongo(json).toString());
		System.out.println(obj);

	}

	public static String coursecodefinder() {
		String coursecodepattern = "[A-Z]{3}\\s?[0-9]{3}[H|Y][1|5][F|S|Y]?";
		Pattern coursecode = Pattern.compile(coursecodepattern);
		Map<String, Integer> results = new HashMap<String, Integer>();
		int count = 0;
		Matcher m = coursecode.matcher(rawtext);
		String finalcoursecode = "";
		int maxcoursecode = 0;
		while (m.find()) {
			count++;
			if (results.containsKey(m.group())) {
				results.put(m.group(), results.get(m.group()) + 1);
				if (results.get(m.group()) > maxcoursecode) {
					finalcoursecode = m.group();
					maxcoursecode = results.get(m.group());
				}
			} else {
				results.put(m.group(), 1);
				finalcoursecode = m.group();
			}
		}
		if (finalcoursecode.length() == 8) {
			finalcoursecode += "Y";
		}
		return finalcoursecode.replaceAll("\\s+", "");

	}

	public static JSONObject connecttoCobalt() throws IOException {
		if (rawtext.contains("Summer") | rawtext.contains("summer")) {
			session = "5";
			if (finalcoursecode.endsWith("F") | finalcoursecode.endsWith("S")) {
				optionalcharacter = finalcoursecode.substring(8);
			}
		} else if (rawtext.contains("Winter") | rawtext.contains("winter")) {
			session = "1";
		} else if (rawtext.contains("Fall") | rawtext.contains("fall")) {
			session = "9";
		} else {
			int month = Calendar.getInstance().get(Calendar.MONTH);
			if (month < 4) {
				session = "1";
			} else if (month >= 4 && month < 8) {
				session = "5";
			} else {
				session = "9";
			}
		}
		int year = Calendar.getInstance().get(Calendar.YEAR);
		if (rawtext.contains(Integer.toString(year))) {
			currentyear = Integer.toString(year);
		} else {
			currentyear = Integer.toString(year + 1);
		}
		String requestURL = "";
		URLConnection connection;
		URL uoftRequest;
		Scanner scanner;
		try {
			requestURL = "http://localhost:4242/1.0/courses/" + finalcoursecode + currentyear + session + optionalcharacter;
			uoftRequest = new URL(requestURL);
			connection = uoftRequest.openConnection();
			scanner = new Scanner(uoftRequest.openStream());
		} catch (Exception e) {
			year += 1;
			currentyear = Integer.toString(year);
			requestURL = "http://localhost:4242/1.0/courses/" + finalcoursecode + currentyear + session + optionalcharacter;
			uoftRequest = new URL(requestURL);
			connection = uoftRequest.openConnection();
			scanner = new Scanner(uoftRequest.openStream());
		}
		connection.setDoOutput(true);
		String response = scanner.useDelimiter("\\Z").next();
		JSONParser parser2 = new JSONParser();
		JSONObject json = null;
		try {
			json = (JSONObject) parser2.parse(response);
		} catch (org.json.simple.parser.ParseException e1) {
			e1.printStackTrace();
		}
		scanner.close();
		return json;
	}

	public static JSONArray getassignments() {
		List<String> assignmentlines = new ArrayList<String>();
		int assignmentcount = 0;
		for (String x : rawTextLines) {
			if (x.contains("%")) {
				if (x.contains("Total 100%")) {
					continue;
				}
				assignmentcount += 1;
				assignmentlines.add(x);
			}
		}
		Parser parser = new Parser();
		List<DateTime> outputdates = new ArrayList<DateTime>();
		int counter = 0;
		JSONArray markedlist = new JSONArray();
		JSONArray minilist = new JSONArray();
		for (String y : assignmentlines) {
			minilist = new JSONArray();
			List<DateGroup> group = parser.parse(y);
			if (y.contains("Final Exam")) {
				minilist.add(y);
				markedlist.add(minilist);
				continue;
			} else if (group.toString() == "[]") {
				continue;
			}
			List<Date> date = (group.get(0)).getDates();
			Date sampledate = date.get(0);
			DateTime dt = new DateTime(sampledate);
			outputdates.add(dt);
			minilist.add(dt.toString());
			minilist.add(y);
			markedlist.add(minilist);
		}
		return markedlist;
	}

	public static String getOfficeHours() {
		Pattern stopWords = Pattern.compile("\\b(?:Office|Hours|office|hours)\\b\\s*", Pattern.CASE_INSENSITIVE);
		for (String rawTextLine : rawTextLines) {
			if (rawTextLine.contains("Office Hours")) {
				Matcher matcher = stopWords.matcher(rawTextLine);
				String clean = matcher.replaceAll("");
				return clean;
			}
		}
		return "Not Available";
	}

	public static String getOfficeLocation() {
		Pattern stopWords = Pattern.compile("\\b(?:Office|Location|office|location)\\b\\s*", Pattern.CASE_INSENSITIVE);
		for (String rawTextLine : rawTextLines) {
			if (rawTextLine.contains("Office Location")) {
				Matcher matcher = stopWords.matcher(rawTextLine);
				String officeLocation = matcher.replaceAll("");
				return officeLocation;
			}
			;
		}
		return "Not Available";
	}

	public static String saveAsJSON(String name) {
		try {
			String savepath = System.getProperty("user.dir") + "/PDFS/JSONOutput/"
				+ name + ".json";
			FileWriter file = new FileWriter(savepath);
			file.write(obj.toJSONString());
			file.flush();
			file.close();
			return savepath;
		} catch (IOException e) {
			e.printStackTrace();
			return "not able to save";
		}
	}

	public static String getUniversityCampus() {
		if (Character.toString(finalcoursecode.charAt(7)).equals("5")) {
			return "UTM";
		} else {
			return "UTSG";
		}
	}

	private static JSONArray changeTimesForMeetingSections(JSONArray sections){
		for (int i = 0; i < sections.size(); i++) {
			JSONObject section = (JSONObject) sections.get(i);
			JSONArray times = (JSONArray) section.get("times");
			for (int j = 0; j < times.size(); j++) {
				JSONObject time = (JSONObject) times.get(j);
				Date startDate = new Date((Long) time.get("start") * 1000);
        		DateFormat format = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
        		format.setTimeZone(TimeZone.getTimeZone("UTC"));
				time.put("start", format.format(startDate));
				Date endDate = new Date((Long) time.get("end") * 1000);
				time.put("end", format.format(endDate));
			}
		}
		return sections;	
	}

	private static String getSemesterStart() {
		Date date = null;
		if (session == "1") {
			date = new GregorianCalendar(currentyear, GregorianCalendar.JANUARY, 2).getTime();
		} else if (session == "5") {
			date = new GregorianCalendar(currentyear, GregorianCalendar.MAY, 8).getTime();
		} else if (session == "9"){
        	date = new GregorianCalendar(currentyear, GregorianCalendar.SEPTEMBER, 6).getTime();
		}
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
		dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
		return dateFormat.format(date);
	}

	private static String getSemesterEnd() {
		Date date = null;
		if (session == "1") {
			date = new GregorianCalendar(currentyear, GregorianCalendar.MARCH, 31).getTime();
		} else if (session == "5") {
			date = new GregorianCalendar(currentyear, GregorianCalendar.AUGUST, 14).getTime();
		} else if (session == "9"){
        	date = new GregorianCalendar(currentyear, GregorianCalendar.DECEMBER, 5).getTime();
		}
		DateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm'Z'");
		dateFormat.setTimeZone(TimeZone.getTimeZone("UTC"));
		return dateFormat.format(date);
	}

	private static JSONArray processeventsformongo(JSONObject json) {
		JSONArray listtoreturn = new JSONArray();
		JSONArray listoflecturesandtutorials = (JSONArray) json.get("meeting_sections");
		for (int i = 0; i < listoflecturesandtutorials.size(); i++) {
			JSONObject lectureortutorial = (JSONObject) listoflecturesandtutorials.get(i);
			JSONArray lectureortutorialtimes = (JSONArray) lectureortutorial.get("times");
			int numberoftimes = lectureortutorialtimes.size();
			for (int j = 0; j < numberoftimes; j++) {
				JSONObject templist = new JSONObject();
				JSONObject tempJson = (JSONObject) lectureortutorialtimes.get(j);
				templist.put("title", lectureortutorial.get("code"));
				templist.put("startTime", tempJson.get("start").toString());
				templist.put("endTime", tempJson.get("end").toString());
				templist.put("backgroundColour", "#000000");
				templist.put("description", (String) obj.get("description"));
				templist.put("location", (String) tempJson.get("location"));
				templist.put("contact", (String) tempJson.get("instructors"));
				templist.put("course", finalcoursecode);
				templist.put("repeat", "0");
				listtoreturn.add(templist);
			}
		}
		return listtoreturn;
	}
}
