/* Execute the actual relay against synthetic evdev, never a physical remote. */
#define _GNU_SOURCE
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <poll.h>
#include <signal.h>
#include <sys/ioctl.h>
#include <sys/file.h>
#include <time.h>
#include <errno.h>
#include <string.h>
#include <stdarg.h>
#include <assert.h>
#ifndef _IOC_READ
#define _IOC_READ IOC_OUT
#endif
static int fake_open(const char*,int,...),fake_close(int),fake_ioctl(int,unsigned long,...),fake_poll(struct pollfd*,nfds_t,int),fake_clock(clockid_t,struct timespec*),fake_flock(int,int);
static ssize_t fake_read(int,void*,size_t),fake_write(int,const void*,size_t);
#define open fake_open
#define close fake_close
#define ioctl fake_ioctl
#define poll fake_poll
#define clock_gettime fake_clock
#define flock fake_flock
#define read fake_read
#define write fake_write
#define main relay_main
#ifndef RELAY_SOURCE
#define RELAY_SOURCE "relay.c"
#endif
#include RELAY_SOURCE
#undef main
static uint64_t now;
static int scenario,grabbed,held,input_event;
static int released,ungrabbed,closed_input,closed_output,blocked_marker,watchdog_marker;
static int fake_open(const char*p,int flags,...){(void)flags;if(strstr(p,"relay.lock"))return 3;if(strstr(p,"/watchdog")){watchdog_marker++;return 4;}if(strstr(p,"/blocked")){blocked_marker++;return 4;}if(strstr(p,"event0"))return 10;if(strstr(p,"event1"))return 11;errno=ENOENT;return -1;}
static int fake_close(int fd){if(fd==10&&grabbed)closed_input++;if(fd==11&&grabbed)closed_output++;return 0;}
static int fake_flock(int fd,int flags){(void)fd;(void)flags;return 0;}
static int fake_clock(clockid_t id,struct timespec*t){(void)id;t->tv_sec=now/1000;t->tv_nsec=(now%1000)*1000000;return 0;}
static int fake_ioctl(int fd,unsigned long request,...){
 va_list args;va_start(args,request);
 if(request==GRAB){int on=va_arg(args,int);if(on){grabbed=1;held=1;}else{assert(released);ungrabbed++;}va_end(args);return 0;}
 void*b=va_arg(args,void*);va_end(args);
 if(request==NAME(256)){strcpy(b,fd==10?"LGE M-RCU - Builtin [0]":"LGE M-RCU - Builtin [1]");return 0;}
 if(request==KEYSTATE(256)){memset(b,0,256);if(held&&fd==11)((unsigned char*)b)[103/8]|=1<<(103%8);return 0;}
 if(request==_IOR('E',0x40,int[6])||request==_IOR('E',0x41,int[6])){memset(b,0,sizeof(int)*6);return 0;}
 memset(b,0,256);return 0;
}
static int fake_poll(struct pollfd*p,nfds_t n,int timeout){(void)n;(void)timeout;now+=scenario==2?100:2101;p[0].revents=0;p[1].revents=0;if(scenario==1)stop=1;if(scenario==2){p[0].revents=POLLIN;p[1].revents=POLLIN;}return 1;}
static ssize_t fake_read(int fd,void*b,size_t size){(void)size;if(fd==0){*(char*)b='P';return 1;}if(fd==10&&scenario==2&&grabbed){struct ev e={0,0,1,773,input_event++%2==0};memcpy(b,&e,sizeof e);return sizeof e;}errno=EAGAIN;return -1;}
static ssize_t fake_write(int fd,const void*b,size_t size){if(fd==11){const struct ev*e=b;assert(e[0].type==1&&e[0].code==103&&e[0].value==0);assert(!ungrabbed);released++;held=0;}return (ssize_t)size;}
int main(void){
 for(scenario=0;scenario<3;scenario++){
  now=0;stop=0;input_event=0;grabbed=held=released=ungrabbed=closed_input=closed_output=blocked_marker=watchdog_marker=0;
  char*args[]={"relay",NULL};int reason=relay_main(1,args);
  assert(reason==(scenario==0?20:scenario==1?0:27));
  assert(watchdog_marker==(scenario==0));assert(blocked_marker==(scenario!=0));
  assert(released==1&&ungrabbed==1&&closed_input==1&&closed_output==1);
 }
 puts("PASS: watchdog uses its own latch; stop/triple Home stay blocked; held keys release before ungrab");
}
