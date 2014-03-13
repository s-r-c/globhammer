#include <stdio.h>

int main() {
	double x;
	*(long *)(&x) = 0x1b70ac60412100;
	//*(long *)(&x) = 0x214160ac701b;
	printf("%f\n", x);

	return 0;
}
