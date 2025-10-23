import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { PostCreate } from './post-create';

describe('PostCreate', () => {
  let component: PostCreate;
  let fixture: ComponentFixture<PostCreate>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostCreate],
      providers: [provideHttpClient()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(PostCreate);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
