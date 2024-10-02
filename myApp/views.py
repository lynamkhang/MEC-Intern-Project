from django.shortcuts import render
from django.http import HttpResponse
from django.db import connection

def firstpage(request):
    return render(request, 'FirstPage.html')

def fetch_data(person_id):
    try:
        # Fetch person info
        with connection.cursor() as cursor:
            sql = """
                    SELECT *
                    FROM public.app_personinfo AS per
                    LEFT JOIN public.app_targetcatgoryinfo AS tar 
                    ON tar."targetID" = per."targetID"
                    LEFT JOIN public.app_registerreasoninfo AS re
                    ON re."reReasonID" = per."reReasonID"
                    LEFT JOIN public.app_paymentinfo AS pay
                    ON pay."paymentID" = per."paymentID"
                    LEFT JOIN public.app_rejectinfo AS rej
                    ON rej."rejectID" = per."rejectID"
                    LEFT JOIN public.app_decisioninfo AS dec
                    ON dec."decisionID" = per."decisionID"
                    LEFT JOIN public.app_draftpersoninfo AS dra
                    ON dra."draftPersonID" = per."draftPersonID"
                    LEFT JOIN public.app_registerpersoninfo AS reg
                    ON reg."registerPersonID" = per."registerPersonID"
                    LEFT JOIN public.app_kannaiinfo AS kan
                    ON kan."kannaiID" = per."kannaiID"
                    LEFT JOIN public.app_gurdianinfo AS gur
                    ON gur."familyId" = per."familyId"
					LEFT JOIN public.app_relationshipinfo AS rel
					ON rel."relationshipID" = per."relationshipID"
					LEFT JOIN public.app_jobcategoryinfo AS job
					ON job."jobID" = per."jobId"
                    WHERE "personId" = %s;
            """
            cursor.execute(sql, [person_id])
            rows = cursor.fetchone()
            columns = [col[0] for col in cursor.description]
            cursor.close()

            data = format_data([rows], columns) if rows else None
            return data
        
    except Exception as e:
        print(f"Error: Person id not found! {e}")
        data = None
        return data
    
def format_data(rows, columns):
    result = []
    for row in rows:
        row_data = {}
        for col, val in zip(columns, row):
            row_data[col] = val if val is not None else ''  # Replace None with ''
        result.append(row_data)
    return result
    
def secondpage(request):
    person_id = request.GET.get('personId')

    if not person_id:
        return render(request, 'SecondPage.html', {'error': 'Person ID not provided.'})

    data = fetch_data(person_id)

    if data:
        # Fetch data for each combobox dynamically
        comboboxes = {
            'jobcategory': fetch_dropdown_data('jobcategory'),
            'relationship': fetch_dropdown_data('relationship'),
            'targetcategory': fetch_dropdown_data('targetcategory'),
            'paymentinfo': fetch_dropdown_data('paymentinfo'),
            'registerreason': fetch_dropdown_data('registerreason'),
            'decisioninfo': fetch_dropdown_data('decisioninfo'),
            'draftpersoninfo': fetch_dropdown_data('draftpersoninfo'),
            'registerpersoninfo': fetch_dropdown_data('registerpersoninfo'),
            'kannaiinfo': fetch_dropdown_data('kannaiinfo'),
            'rejectinfo': fetch_dropdown_data('rejectinfo'),
            # Add more comboboxes if needed
        }

        context = {
            'data': data[0],
            'combobox_data': comboboxes,
        }
        return render(request, 'SecondPage.html', context)
    else:
        return render(request, 'SecondPage.html', {'error': 'Person ID not found or no data available.'})


# Define a dictionary to map table names to their corresponding SQL queries
table_queries = {
    'jobcategory': 'SELECT "jobID", "jobType" FROM public.app_jobcategoryinfo ORDER BY id ASC',
    'relationship': 'SELECT "relationshipID", "relationshipType" FROM public.app_relationshipinfo ORDER BY id ASC',
    'targetcategory': 'SELECT "targetID", "targetName" FROM public.app_targetcatgoryinfo ORDER BY id ASC',
    'paymentinfo': 'SELECT "paymentID", "paymentType" FROM public.app_paymentinfo ORDER BY id ASC',
    'registerreason': 'SELECT "reReasonID", "reReasonName" FROM public.app_registerreasoninfo ORDER BY id ASC',
    'decisioninfo': 'SELECT "decisionID", "decisionType" FROM public.app_decisioninfo ORDER BY id ASC',
    'draftpersoninfo': 'SELECT "draftPersonID", "draftPersonName" FROM public.app_draftpersoninfo ORDER BY id ASC',
    'registerpersoninfo': 'SELECT "registerPersonID", "registerPersonName" FROM public.app_registerpersoninfo ORDER BY id ASC',
    'kannaiinfo': 'SELECT "kannaiID", "kannaiType" FROM public.app_kannaiinfo ORDER BY id ASC',
    'rejectinfo': 'SELECT "rejectID", "rejectType" FROM public.app_rejectinfo ORDER BY id ASC',
}

def fetch_dropdown_data(table_name):
    try:
        with connection.cursor() as cursor:

            # Check if the table_name is valid
            if table_name not in table_queries:
                return HttpResponse(f"Invalid table name: {table_name}")
                        
            sql = table_queries[table_name]
            cursor.execute(sql)
            rows = cursor.fetchall()
            rows = format_dropdown_data(rows)
            cursor.close()
            
            # Structure the data for use in the template
            data = [{'id': row[0], 'name': row[1]} for row in rows]
            return data

    except Exception as e:
        print(f"Error fetching data: {e}")
        return []
    
def format_dropdown_data(data):
    return [
        tuple("" if value == "**" else value for value in row)
        for row in data
    ]
