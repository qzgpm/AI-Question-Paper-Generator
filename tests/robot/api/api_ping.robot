*** Settings ***
Library    RequestsLibrary
Library    Collections

*** Variables ***
${BASE_URL}    http://localhost:8000

*** Test Cases ***
Check API Is Responsive
    [Documentation]    Verify that the CSRF endpoint returns a 200 OK.
    Create Session    django    ${BASE_URL}
    ${response}=    GET On Session    django    /accounts/api/csrf/    expected_status=200
    Should Be Equal As Integers    ${response.status_code}    200
    Dictionary Should Contain Key    ${response.json()}    status
