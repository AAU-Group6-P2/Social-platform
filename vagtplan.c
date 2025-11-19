#include <stdio.h>
#include <string.h>

struct user
{
char username[20];
char password[20];
char pref_days[20][20];
char assinged_shifts[20][20];
};
typedef struct user user;


int main (void){


user User_1 = {"VikRas22", "asdkasd", "Mandag" "Tirsdag" "Onsdag" "Torsdag", "Mandag" "Tirsdag" "Onsdag" "Torsdag"};

printf("%s",User_1.username);




return 0;
}





