import {Component} from '@angular/core';
import {ConfiguratorComponent} from './pages/configurator/configurator.component';

@Component({
  selector: 'app-root',
  imports: [
    ConfiguratorComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'dodod';
}
