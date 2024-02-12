from airflow.decorators import dag, task
from utils import handleStderr, handleStdout
import pendulum
import subprocess


@dag(
  catchup=False, 
  schedule=None,
  schedule_interval='@daily',
  start_date=pendulum.datetime(2024, 2, 1, tz='UTC'),
  tags=['tcgcsv']
)
def scrape_tcgcsv_products() -> None:

  @task()
  def scrape_tcgroups() -> None: 
    '''
    Calls the loadTCGroupss.sh script to load TCGroup data from TCGCSV into 
    the db
    '''
    path = '/home/vmuser/tcg-portfolio/backend/scripts/loadTCGroups.sh'
    res = subprocess.run([path], capture_output=True, text=True)

    handleStdout(res.stdout)
    handleStderr(res.stderr, 'Error in scrape_tcgroups()')


  @task()
  def scrape_nonsl_tcproducts() -> None: 
    '''
    Calls the loadTCProducts.sh script to load non Secret Lair TCProduct data 
    from TCGCSV into the db
    '''
    path = '/home/vmuser/tcg-portfolio/backend/scripts/loadTCProducts.sh'
    res = subprocess.run([path], capture_output=True, text=True)

    handleStdout(res.stdout)
    handleStderr(res.stderr, 'Error in scrape_nonsl_tcproducts()')


  @task()
  def scrape_sl_tcproducts() -> None: 
    '''
    Calls the loadSLTCProducts.sh script to load Secret Lair TCProduct data 
    from TCGCSV into the db
    '''
    path = '/home/vmuser/tcg-portfolio/backend/scripts/loadSLTCProducts.sh'
    res = subprocess.run([path], capture_output=True, text=True)

    handleStdout(res.stdout)
    handleStderr(res.stderr, 'Error in scrape_sl_tcproducts()')
   

  [scrape_sl_tcproducts(), scrape_tcgroups()] >> scrape_nonsl_tcproducts()

products = scrape_tcgcsv_products()