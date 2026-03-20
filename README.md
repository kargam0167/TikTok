# Reproducibility Package: Qualitative LLM-Assisted Analysis of Digital Nomad Identities on TikTok

The primary goal of this research is to apply a socio-technical grounded theory approach to understand the formation and evolution of collective identity among digital nomads on TikTok. The author analyzes the co-occurrence of thematic codes over time using the Jaccard index to identify memetic trends and shifts in community focus (e.g., from 'self-actualization' to 'affordability').
The original dataset Dataset_Hashed.csv is sourced from TikTok and collected through the unofficial TikTok API [TIKAPI](https://tikapi.io/) using a set of specific hashtags:
    
    Hashtags
    
    - #digitalnomadlifestyle
    - #digitalnomadlife
    - #digitalnomad
    - #remotework
    - #travellife
    - #workfromanywhere
    
TikAPI retrieves metadata listed below for TikTok videos associated with a given hashtag and does not limit the results to a percentage of the total. 

 **[TikAPI documentation](https://tikapi.io/documentation/#tag/Profile)**

-The collection of this dataset was initiated prior to the release of TikTok native Research API in Europe.

-Data Collection & Processing

The /hashtag/videos endpoint of the TikAPI was used to retrieve TikTok video metadata associated with a given hashtag. It returns a list of video objects containing metadata like ID, description, stats, etc.
- There is no mention of limiting or sampling the results to a subset of available videos.
- The pagination parameters allow retrieving all available results across multiple pages, implying that complete retrieval is possible.
- The collected JSON data for each hashtag was consolidated into a single dataset
- Important to note that due to the dynamic nature of social media, an exact replication of the raw data at a later date is not feasible as videos and accounts may be deleted.

***

The Jupiter Notebook **Collect_Hashtags.ipynb** has been executed six times, once for each hashtag, starting with "#digitalnomad". It fetches a maximum of 50 pages of data related to the hashtag and handles possible exceptions that could occur during the process.
The output of six JSON files were compiled into a comprehensive JSON file that has a hierarchical structure; the  study employed the main dictionary called `itemList,` which contains:

- 'author' metadata represents TikTok creator information.
- 'authorStats,' which contains statistics such as the number of followers and videos published.
- id: The unique id of the video
- desc: metadata of the video post
- stats: View and like counts
- music: Details about the background music
- video: Technical details about the video, such as resolution, size, etc.


***
TikTok Video Dataset **Dataset_Hashed.csv**

Only absolutely necessary data points for the study are stored in Dataset_Hashed.csv_

| Field | Description | Type |
| --- | --- | --- |
| hashed_videoId | ID number of the video Anonymized| integer |
| datetime | UTC stamp of when the TikTok video was uploaded | datetime |
| desc | The caption from the video | string |
| hashtagNames | Name of the hashtag | string |
| stickersText | Text captions used in the video | string |

***

Anonymization and Privacy

To ensure the security of the collected data, the study follows following protocol:

- API Key Security: The TikAPI and Perplexity AI keys are stored as an environment variable on the server-side and not be exposed in the front-end or version control systems.
- Secure Storage: The collected raw data, which is in JSON format, is stored in a secure, access-controlled database with encryption at rest.
- Access Control: Access to the raw data is restricted to the author only, through the use of strong passwords.
- To protect creators privacy, identifiers such as authorId and videoId are anonymized.
- The authorId and videoId fields were hashed using a one-way process with a salt.

***

**LLM_Asisted_Coding.ipynb**

This notebook automates qualitative coding of large-scale TikTok digital nomad data using Large Language Models (LLMs). It provides a reproducible workflow for applying a tailored codebook to TikTok metadata (descriptions, hashtags, captions) in two main phases:

- **Phase 1:** The notebook uses an LLM API with a hardened, structured prompt to assign up to five qualitative codes to each TikTok post based on its textual content and a detailed codebook reflecting journey narrative, digital representation, commercialization, symbolism, existential themes, hedonism, and platform affordances.
- **Phase 2:** A second-order coding step further classifies assigned codes into collective identity “elements” (Worker, Tourist, Migrant, Pilgrim) and their associated psychological needs (based on Maslow’s hierarchy). This utilizes a dedicated prompt and theoretical framework to ensure interpretive consistency and trace deeper structural trends.
- **Features:**
  - Robust retry logic for API stability
  - Checkpointing to resume interrupted runs and handle large datasets
  - JSON parsing safeguards for reliable extraction of LLM output
  - Includes code for identifying and analyzing failed entries

This notebook is central to the project's computational grounded theory methodology, enabling scalable, transparent, and reproducible qualitative analysis of TikTok content. 
Researches can adapt the codebook, retrain on new data, and extend the framework for other social media platforms as needed.
The output files from the assisted coding process: **elements_results_hashed.json** and **needs_results_hashed.json** are available in the repository.

***

Supplementary Data Files & Outputs. 

These files **joined_needs_elements_code.csv** and **combined_human_model_codes.csv** supplement the main dataset **Dataset_Hashed.csv**, **Codebook for the Qualitative Content Analysis.pdf**, and are used in Python Notebook **TikTok_Data_Analysis.ipynb** 

**Data Analysis**
Python Code used for the data analysis: **TikTok_Data_Analysis.ipynb**

Following CSV files include observed values, permutation means, and empirical p-values, enabling direct verification of statistical significance for each digital nomad archetype.

1. Jaccard co-occurrence tables for each main element, data presents the complete pairwise co-occurrence logic as used for all heatmaps and quantitative content analysis.

**jaccard_table_Migrant.csv**

**jaccard_table_Worker.csv**

**jaccard_table_Pilgrim.csv**

**jaccard_table_Tourist.csv**


2. Each file below contains permutation test results for selected code pairs by element.

**permutation_test_results_Tourist.csv**

**permutation_test_results_Migrant.csv**

**permutation_test_results_Pilgrim.csv**

**permutation_test_results_Worker.csv**

3. Below CSV file contains intercept and fixed slope (Quarter_num) for each group (element_need) from mixed effects models. Use to evaluate longitudinal controls and per-group temporal trends.

*mixed_model_group_coefficients.csv**

4. Average Jaccard score trends by need and element over time. Supports inspection of overall identity and code co-occurrence shifts.

**avg_jaccard_trend_by_need_per_element.csv**


***

**Data Compliance**

The dataset is reconciled monthly against the TikTok Research API [Batch Compliance endpoint](https://developers.tiktok.com/doc/batch-compliance-apis) to remove deleted, private, or otherwise unavailable content. A multi-pass verification framework submits unhashed video IDs in batches, re-checks flagged deletions until results converge, and updates the public dataset. Real video IDs are processed in memory only and never stored publicly.
