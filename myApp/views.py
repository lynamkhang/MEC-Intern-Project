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
    if not rows:  # If there are no rows, return None
        return None

    row_data = {}
    for col, val in zip(columns, rows[0]): 
        row_data[col] = val if val is not None else ''  # Replace None with ''

    return row_data  
    
def secondpage(request):
    person_id = request.GET.get('personId')

    if not person_id:
        return render(request, 'SecondPage.html', {'error': 'Person ID not provided.'})

    data = fetch_data(person_id)

    if data:
        # Fetch data for each combobox dynamically
        comboboxes = {
            'jobcategory': fetch_dropdown_data('jobcategoryinfo'),
            'relationship': fetch_dropdown_data('relationshipinfo'),
            'targetcategory': fetch_dropdown_data('targetcatgoryinfo'),
            'paymentinfo': fetch_dropdown_data('paymentinfo'),
            'registerreason': fetch_dropdown_data('registerreasoninfo'),
            'decisioninfo': fetch_dropdown_data('decisioninfo'),
            'draftpersoninfo': fetch_dropdown_data('draftpersoninfo'),
            'registerpersoninfo': fetch_dropdown_data('registerpersoninfo'),
            'kannaiinfo': fetch_dropdown_data('kannaiinfo'),
            'rejectinfo': fetch_dropdown_data('rejectinfo'),
        }

        context = {
            'data': data,
            'combobox_data': comboboxes,
        }
        return render(request, 'SecondPage.html', context)
    else:
        return render(request, 'SecondPage.html', {'error': 'Person ID not found or no data available.'})


# Define a dictionary to map table names to their corresponding SQL queries
table_columns = {
    'jobcategoryinfo': ('jobID', 'jobType'),
    'relationshipinfo': ('relationshipID', 'relationshipType'),
    'targetcatgoryinfo': ('targetID', 'targetName'),
    'paymentinfo': ('paymentID', 'paymentType'),
    'registerreasoninfo': ('reReasonID', 'reReasonName'),
    'decisioninfo': ('decisionID', 'decisionType'),
    'draftpersoninfo': ('draftPersonID', 'draftPersonName'),
    'registerpersoninfo': ('registerPersonID', 'registerPersonName'),
    'kannaiinfo': ('kannaiID', 'kannaiType'),
    'rejectinfo': ('rejectID', 'rejectType'),
}

def generate_query(table_name):
    # Check if the table name exists in the mapping
    if table_name in table_columns:
        item_id, item_type = table_columns[table_name]
        return f'SELECT "{item_id}", "{item_type}" FROM public.app_{table_name} ORDER BY "{item_id}" ASC'
    else:
        raise ValueError(f"Table {table_name} is not defined.")

def fetch_dropdown_data(table_name):
    try:
        with connection.cursor() as cursor:

            sql = generate_query(table_name)
            cursor.execute(sql)
            rows = cursor.fetchall()
            rows = format_dropdown_data(rows)
            cursor.close()
            
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
