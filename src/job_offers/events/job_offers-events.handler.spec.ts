import { JobOffersEventsHandler } from './job_offers-events.handler';

describe('JobOffersEventsHandler', () => {
  let handler: JobOffersEventsHandler;
  const mockService = { findOne: jest.fn() } as any;

  beforeEach(() => {
    handler = new JobOffersEventsHandler(mockService as any);
    jest.clearAllMocks();
  });

  it('logs processing and success when job offer exists', async () => {
    const consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    mockService.findOne.mockResolvedValue({ id: 1, title: 'My Offer' } as any);

    await handler.handleJobOfferCreated({ id: 1 } as any);

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Processing new job offer creation event for offer ID: 1'));
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Job offer My Offer (ID: 1) successfully registered and processed.'));

    consoleLogSpy.mockRestore();
  });

  it('logs error when service throws', async () => {
    const err = new Error('test');
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockService.findOne.mockRejectedValue(err);

    await handler.handleJobOfferCreated({ id: 2 } as any);

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Failed to process job offer creation event for offer ID: 2'), err);

    consoleErrorSpy.mockRestore();
  });
});
