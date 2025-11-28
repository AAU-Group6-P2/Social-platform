#include <stdio.h>
#include <string.h>
#include <stdlib.h>

// User Data
struct user
{
    char username[20];
    char password[20];
    char pref_days[20][20];
    char assigned_shifts[20][20];
};
typedef struct user user;

// PROTOTYPER:
int introduction();
void CheckOption(int option);
void login(user *u);
void reg();
void usermenu(user *u);


// MAIN:
int main(void)
{
    
    int option = introduction(); // Scanf
    CheckOption(option);         // determined answear

    return 0;
}

// FUNCTIONS:

// introduktions funktion til brugeren:
int introduction()
{

    int answer;

    printf("----Welcome to SmartPlan alpha version----\n");
    printf("----You now have the following options----\n1:--->(Login)\n2:--->(Register)\n--->");

    while (1)
    {
        scanf("%d", &answer);

        if (answer == 1 || answer == 2 || answer == 456)
        {
            return answer;
            break;
        }
        else
        {
            printf("Invalid input try again!\n");
        }
    }
}

// Checkoption
void CheckOption(int option)
{
    if (option == 1)
    {
        user logged_in_user;
        // Login Function
        login(&logged_in_user);
    }
    else if (option == 2)
    {
        // Register
        reg();
    }
    else if (option == 456)
    {
        // Admin register
        printf("here you can login as a Admin");
    }
    else
    {
        printf("Error");
        exit(0);
    }
}

// login
void login(user *u)
{
    char username[20], password[20], file_username[20], file_password[20];

    FILE *f = fopen("Users.txt", "r");
    if (!f)
    {
        printf("There's no account yet, please create one first.\n");
        exit(EXIT_FAILURE);
    }

    while (1)
    {
        printf("Enter username:-->");
        scanf("%s", username);
        printf("Enter password:-->");
        scanf("%s", password);
        printf("\n");
        int match = 0;
        rewind(f);

        while (fscanf(f,"%[^:]:%s\n", file_username, file_password) == 2)
        {
            if (strcmp(username, file_username) == 0 &&
                strcmp(password, file_password) == 0)
            {
                match = 1;
                break;
            }
        }

        if (match)
        {
            strcpy(u->username, username);
            strcpy(u->password, password);

            printf("You have successfully logged in!\n");
            printf("----Welcome to SmartPlan----\n----%s----\n\n\n", u->username);
            // calling the usermenu to the user who's logged in.
            usermenu(u); 
             break;         
        }
        else
        {
            printf("Username or password incorrect! try again.\n");
        }
    }

    fclose(f);
}


// Register
void reg() // The user will be registered
{

    int reg_succesful = 0;
    char username[20], password[20];
    printf("----You have entered register mode----\n\nPlease Create your Username --->");
    scanf("%s", username);
    // Save this username in the file>Users

    printf("Please Create your Password --->");
    scanf("%s", password);
    // Save this Password in the file>Users

    FILE *f = fopen("Users.txt", "a");

    if (f == NULL)
    {

        printf("ERROR opening the file!!!!!");
        exit(EXIT_FAILURE);
    }
    else
    {

        reg_succesful = 1;
        fprintf(f, "%s:%s\n", username, password);

        fclose(f);

        if (reg_succesful == 1)
        {
            printf("User registered succcessfully\n");
            CheckOption(1);
        }
    }
}

// Menu for specifik user
void usermenu(user *u)
{  
    int option_answer;
    int return_answer;

    printf("This is the menu for the user:---%s---:\n", u->username);
    
    //options for the user who's logged in:
    printf("1:--> See workshedule:\n");
    printf("2:--> edit workpreference:\n");
    printf("3:--> See workpreference:\n");
    printf("4:--> logout:\n\n");
    
    scanf("%d",&option_answer);

    //checks the answer:
    if(option_answer == 4)
    {
        printf("You are now logged out of the account: %s\n\n", u->username);

        printf("Do you wish to login again?\n");
        printf("1:--> (yes)\n2:--> (no)\n");
        scanf("%d",&return_answer);

        if(return_answer == 1)
        {
            login(u); 
        }
        else
        {
            printf("Thank you for using our service!");
        }
    }
}





