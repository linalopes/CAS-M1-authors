import gspread
from oauth2client.service_account import ServiceAccountCredentials
import pandas as pd
import openai
import re  # Importing the library for regular expressions


# Set up the OpenAI API key
openai.api_key = 'OpenAI API key'

# Set up Google Sheets API credentials
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name('GoogleKey.json', scope)
client = gspread.authorize(creds)

# Open Google Spreadsheet
spreadsheet = client.open("ML1_authors")
sheet = spreadsheet.sheet1  # Supondo que os dados estão na primeira aba

# Load spreadsheet data into a Pandas DataFrame
data = pd.DataFrame(sheet.get_all_records())

# Function to use OpenAI to interpret the "Years of Research" and calculate the duration
def get_duration_from_openai(years_of_research):
    prompt = f"Given the research period '{years_of_research}', calculate the total duration in years. \
               If the period is a range (e.g., 1950-1980), calculate the difference between the years. \
               If the end is 'present' or 'ongoing', assume the year 2024. If it's a decade (e.g., 1920s), \
               calculate how many years that represents. Give me as a ansewer first only the number of years, nohing more."
    
    print(f"Sending prompt to OpenAI: {prompt}")  # Debugging line to see the prompt sent
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an assistant that calculates the duration of research periods."},
                {"role": "user", "content": prompt}
            ]
        )
        
        duration = response['choices'][0]['message']['content'].strip()
        print(f"Received duration: {duration}")  # Debugging line to see the response

        # Extracting the number from the response using regex
        match = re.search(r'(\d+)', duration)
        if match:
            return int(match.group(1))  # Returns the duration number (years)
        else:
            return None  # If no number is found, return None
    
    except Exception as e:
        print(f"Error during OpenAI API call: {str(e)}")  # Catch errors in the API call
        return None

# Apply duration calculation function on 'Years of Research' column with OpenAI
data['Duration'] = data['years-of-research'].apply(get_duration_from_openai)

# Check if the calculation is correct
print(data[['years-of-research', 'Duration']])

# Update data in Google Sheets spreadsheet
# Turn DataFrame back into list of lists (for Google Sheets)
updated_data = [data.columns.values.tolist()] + data.values.tolist()
sheet.clear()  # Clear the sheet before updating
sheet.update(updated_data)  # Updates data with new columns

print("Spreadsheet updated successfully!")