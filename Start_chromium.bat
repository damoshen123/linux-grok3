@echo off

echo ���ڰ�װ Playwright...
call npm install playwright

echo ���ڰ�װ Chromium...
call npm exec playwright install chromium

REM ��װ������
call npm install

echo ��������...
node server.js


REM ��ͣ�ű�ִ��,�ȴ��û���������˳�
pause
