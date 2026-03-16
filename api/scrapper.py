# Import the requests library
# This is used to send HTTP requests to a website
import requests

# Import BeautifulSoup from bs4
# BeautifulSoup is used to parse HTML and extract data from web pages
from bs4 import BeautifulSoup

# Import time to slow down requests and avoid blocking
import time


# Target URL that we want to scrape
URL = "https://www.ambitionbox.com/list-of-companies"


# Headers are used to mimic a real browser request
# Many websites block bots, so setting a User-Agent helps avoid blocking
headers = {
    "User-Agent": "Mozilla/5.0"
}


# Function that scrapes company data from AmbitionBox
def get_companies():

    # Create an empty list to store company data
    companies = []

    # Loop through multiple pages (AmbitionBox has around 333 pages)
    for page in range(1, 30):

        # Build URL for each page
        page_url = f"{URL}?page={page}"

        print(f"Scraping page {page}...")

        # Send a GET request to the website
        # timeout=30 ensures the request fails if it takes more than 30 seconds
        response = requests.get(page_url, headers=headers, timeout=30)

        # Raise an exception if the response contains an HTTP error
        # Example errors: 404 (not found), 500 (server error)
        response.raise_for_status()

        # Convert the HTML content into a BeautifulSoup object
        # This allows us to search and extract elements easily
        soup = BeautifulSoup(response.text, "html.parser")

        # Find all company cards on the page
        # Each company is inside a div with class "companyCardWrapper"
        cards = soup.find_all("div", class_="companyCardWrapper")

        # Loop through each company card
        for card in cards:

            # -----------------------------
            # Extract Company Name
            # -----------------------------

            # The company name is inside an <h2> tag
            name = card.find("h2").text.strip()

            # -----------------------------
            # Extract Company Rating
            # -----------------------------

            # select_one uses CSS selectors to find the element
            rating_tag = card.select_one(
                ".companyCardWrapper__companyRatingWrapper .rating_text div"
            )

            # If the rating element exists, extract the text
            # Otherwise return "N/A"
            rating = rating_tag.text.strip() if rating_tag else "N/A"

            # -----------------------------
            # Extract Reviews and Stats
            # -----------------------------

            # Default value for reviews
            reviews = "N/A"

            # List to store other statistics like salaries, interviews etc.
            stats = []

            # Select all action wrapper elements
            action_tags = card.select("a.companyCardWrapper__ActionWrapper")

            # Loop through each stat element
            for action in action_tags:

                # Extract the count number (example: 74k)
                count_tag = action.select_one("span.companyCardWrapper__ActionCount")

                # Extract the title (example: Reviews, Salaries, Interviews)
                title_tag = action.select_one("span.companyCardWrapper__ActionTitle")

                # Skip if either element is missing
                if not count_tag or not title_tag:
                    continue

                # Clean text values
                title = title_tag.text.strip()
                count = count_tag.text.strip()

                # If the title is "Reviews", store it separately
                if title == "Reviews":
                    reviews = count

                # Store all stats in a list
                stats.append(f"{title}: {count}")

            # -----------------------------
            # Extract Company Info
            # -----------------------------

            # This section usually contains industry, employees, location etc.
            about_tag = card.find("span", class_="companyCardWrapper__interLinking")

            # Extract text if available
            about = about_tag.text.strip() if about_tag else "N/A"

            # -----------------------------
            # Store the extracted data
            # -----------------------------

            companies.append({
                "name": name,
                "rating": rating,
                "reviews": reviews,
                "about": about,
                "stats": stats
            })

        # Sleep for a short time to avoid sending too many requests
        time.sleep(1)

    # Return the list of companies
    return companies


# -----------------------------------------
# This block runs only if the script
# is executed directly (not imported)
# -----------------------------------------
if __name__ == "__main__":

    # Call the scraper function
    data = get_companies()

    # Print each company dictionary
    for company in data:
        print(company)

    print("Total companies scraped:", len(data))