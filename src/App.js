import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useClearCache } from 'react-clear-cache';

import Login from './pages/login/login';
import Projects from './pages/projects/projects';
import Calendar from './pages/calendar/calendar';
import Requests from './pages/requests/requests';

import { LicenseInfo } from '@mui/x-license-pro';
import OpenProject from './pages/openProject/openProject';
import OpenRequest from './pages/openRequest/openRequest';
import Briefs from './pages/briefs/briefs';
import OpenBrief from './pages/openBrief/openBrief';
import Reports from './pages/reports/reports';
import Hierarchy from './pages/hierarchy';

LicenseInfo.setLicenseKey('f94999c7685f2608811fb8b48423f2baTz00ODIyNyxFPTE2OTA3Mzk3NTYzNjgsUz1wcm8sTE09c3Vic2NyaXB0aW9uLEtWPTI=');

function App() {
  const { isLatestVersion, emptyCacheStorage } = useClearCache();

  useEffect(() => {
    if(!isLatestVersion) {
      emptyCacheStorage()
    }
  }, [])

  return (
    <Routes>
        <Route exact path='/' element={<Login />} />
        <Route exact path='/projects' element={<Projects />} />
        <Route exact path='/projects/:id' element={<OpenProject />} />
        <Route exact path='/calendar' element={<Calendar />} />
        <Route exact path='/requests' element={<Requests />} />
        <Route exact path='/requests/:id' element={<OpenRequest />} />
        <Route exact path='/briefs' element={<Briefs />} />
        <Route exact path='/briefs/:id' element={<OpenBrief />} />
        <Route exact path='/reports' element={<Reports />} />
        <Route exact path='/hierarchy' element={<Hierarchy />} />
    </Routes>
  );
}

export default App;
