from airflow.exceptions import AirflowFailException


# ===============
# stdout / stderr
# ===============

def handleStdout(stdout: str) -> None:
  '''
  DESC
    Handles stdout stream from an Airflow task run
  INPUT
    stdout: The stdout string
  '''
  print('--- stdout ---')
  print(stdout)


def handleStderr(stderr: str, message: str) -> None:
  '''
  DESC
    Handles stderr stream from an Airflow task run and raises an 
    AirflowFailException if necessary
  INPUT
    stdout: The stderr string
    message: The error message to display
  '''
  print('--- stderr ---')
  print(stderr)

  if (stderr):
    raise AirflowFailException(message)