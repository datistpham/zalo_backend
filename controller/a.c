#include "stdio.h"

float tinhTong(int a[], int n) {
    float tong= 0.0;
    for(int i=0; i<n; i++) {
        tong+= 1.0 / (2.0 * a[i]);
    }
    return tong;
}
int main() {
    int n;
    printf("Nhap n: ");
    scanf("%d", &n);
    int a[n];
    for(int i=0; i<n;i++) {
        printf("Nhap phan tu thu %d: ", i+1);
        scanf("%d", &a[i]);
    }
    printf("\n");
    printf("Cac so am trong mang a la: \n");
    for(int i=0;i< n;i++) {
        if(a[i] < 0) {
            printf("%d\n", a[i]);
        }
    }
    printf("\nTong day so la: %0.4f", tinhTong(a, n));

}