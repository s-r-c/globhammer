#include <stdio.h>

int main() {
	int arr[] = {1,2,3};
	int *x = arr;
	int *y = &arr[2];

	int diff = y - x;
	x += diff;
	*x = 5; // -> the array is {1,2,5}.

	return 0;
}
