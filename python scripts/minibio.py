import openai
import gspread
from oauth2client.service_account import ServiceAccountCredentials

# Set up the OpenAI API key
openai.api_key = 'OpenAI API key'

# Set up Google Sheets API credentials
scope = ["https://spreadsheets.google.com/feeds", "https://www.googleapis.com/auth/drive"]
creds = ServiceAccountCredentials.from_json_keyfile_name('GoogleKey.json', scope)
client = gspread.authorize(creds)

# Open the Google Sheet
spreadsheet = client.open("ML1_authors")
worksheet = spreadsheet.sheet1  # Access the first sheet

# Fetch all the data from the sheet
rows = worksheet.get_all_values()

# Function to generate mini bio using OpenAI GPT-4
def generate_mini_bio(author, notable_work, key_contribution, key_paper, books_or_artworks, years_of_research, institution, city_country):
    prompt = f"""
    Write a concise mini bio for {author}, who is known for their notable work "{notable_work}". 
    Their key contribution to the field includes "{key_contribution}". 
    They have published important work such as "{key_paper}", and are also recognized for "{books_or_artworks}". 
    With {years_of_research} years of research experience at {institution} located in {city_country}, summarize their impact and background.
    """
    
    response = openai.ChatCompletion.create(
        model="gpt-4",
        messages=[
            {"role": "system", "content": "You are a helpful assistant that writes concise biographies."},
            {"role": "user", "content": prompt}
        ]
    )
    
    return response.choices[0].message.content.strip()


# Iterate over the rows and generate mini bios
for i, row in enumerate(rows[1:], start=2):  # Skip the header row
    author = row[0]
    notable_work = row[1]
    key_contribution = row[2]
    key_paper = row[3]
    books_or_artworks = row[4]
    years_of_research = row[5]
    institution = row[6]
    city_country = row[7]

    # Generate the mini bio
    if author and notable_work:  # Ensure there are valid values for required fields
        mini_bio = generate_mini_bio(author, notable_work, key_contribution, key_paper, books_or_artworks, years_of_research, institution, city_country)
        worksheet.update_cell(i, 10, mini_bio)  # Update the 10th column with the mini bio

print("Mini bios have been successfully generated and added to the spreadsheet.")
