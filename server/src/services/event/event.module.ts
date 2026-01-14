import { Inject, Module, OnApplicationBootstrap } from '@nestjs/common';
import {
  EventEmitterModule,
  EventEmitterReadinessWatcher,
} from '@nestjs/event-emitter';

@Module({
  imports: [EventEmitterModule.forRoot()],
})
export class EventModule implements OnApplicationBootstrap {
  constructor(
    @Inject() private readonly watcher: EventEmitterReadinessWatcher,
  ) {}

  async onApplicationBootstrap() {
    await this.watcher.waitUntilReady();
  }
}
