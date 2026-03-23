*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}             http://localhost:5173/login
${BROWSER}         headlesschrome
${EMAIL}           test@example.com
${PASSWORD}        password123
${TIMEOUT}         10s

*** Test Cases ***
Verify Login Page Load
    [Documentation]    Verify that the login page loads with the correct title and elements.
    Open Browser    ${URL}    ${BROWSER}
    Wait Until Page Contains    KTU-QGen    timeout=${TIMEOUT}
    Page Should Contain Element    xpath://input[@type='email']
    Page Should Contain Element    xpath://input[@type='password']
    Page Should Contain    Sign In
    [Teardown]    Close Browser

Successful Login Attempt
    [Documentation]    Attempt to login with valid credentials (placeholder test).
    Open Browser    ${URL}    ${BROWSER}
    Input Text      xpath://input[@type='email']       ${EMAIL}
    Input Password  xpath://input[@type='password']    ${PASSWORD}
    Click Button    xpath://button[@type='submit']
    # Wait for navigation or error
    # Wait Until Page Contains    Dashboard    timeout=5s
    [Teardown]    Close Browser


